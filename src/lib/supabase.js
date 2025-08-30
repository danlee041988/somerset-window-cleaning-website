import { createClient } from '@supabase/supabase-js'
import { EmailService } from './email-service.js'

// Supabase configuration
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations for bookings
export class BookingService {
  
  /**
   * Create or get existing customer by email
   */
  static async upsertCustomer(customerData) {
    try {
      // First try to find existing customer by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerData.email)
        .single()

      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await supabase
          .from('customers')
          .update({
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone,
            address: customerData.address,
            postcode: customerData.postcode,
            city: customerData.city,
            property_type: customerData.property_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert(customerData)
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error upserting customer:', error)
      throw error
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  /**
   * Get service by slug
   */
  static async getServiceBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching service:', error)
      throw error
    }
  }

  /**
   * Complete booking submission with customer and booking creation
   */
  static async submitBooking(formData) {
    try {
      // Extract customer data
      const customerData = {
        first_name: formData.fullName.split(' ')[0],
        last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postcode: formData.postcode.toUpperCase(),
        city: formData.city,
        property_type: formData.propertyType,
        communication_preferences: {
          email: formData.contactMethod === 'email',
          phone: formData.contactMethod === 'phone',
          sms: formData.contactMethod === 'sms'
        },
        special_instructions: formData.notes || null
      }

      // Create or update customer
      const customer = await this.upsertCustomer(customerData)

      // Get window cleaning service
      const service = await this.getServiceBySlug('window-cleaning')
      
      if (!service) {
        throw new Error('Window cleaning service not found')
      }

      // Prepare booking data
      const bookingData = {
        customer_id: customer.id,
        service_id: service.id,
        booking_date: formData.preferredDate ? new Date(formData.preferredDate).toISOString().split('T')[0] : null,
        time_slot: 'morning', // Default to morning slot
        status: 'pending',
        priority: 'normal',
        base_price: formData.estimatedPrice || service.base_price,
        total_price: formData.estimatedPrice || service.base_price,
        payment_status: 'pending',
        internal_notes: JSON.stringify({
          property_type: formData.propertyType,
          frequency: formData.frequency,
          additional_services: formData.additionalServices,
          contact_method: formData.contactMethod,
          form_submitted_at: new Date().toISOString(),
          booking_reference: 'SWC-' + Date.now().toString().slice(-6)
        })
      }

      // Create booking
      const booking = await this.createBooking(bookingData)

      // Send notification emails
      try {
        // Send customer confirmation
        await EmailService.sendBookingConfirmation(booking, customer)
        
        // Send internal notification to business owner
        await EmailService.sendInternalNotification(booking, customer)
        
        // Send SMS if customer prefers SMS contact
        if (formData.contactMethod === 'sms' || formData.contactMethod === 'phone') {
          await EmailService.sendBookingConfirmationSMS(booking, customer)
        }
        
      } catch (emailError) {
        console.warn('Email notification failed:', emailError)
        // Don't fail the booking if email fails
      }

      return {
        success: true,
        customer,
        booking,
        reference: JSON.parse(booking.internal_notes).booking_reference
      }

    } catch (error) {
      console.error('Booking submission error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send booking confirmation communication
   */
  static async sendBookingConfirmation(customerId, bookingId, contactMethod) {
    try {
      const communicationData = {
        customer_id: customerId,
        booking_id: bookingId,
        communication_type: 'booking_confirmation',
        channel: contactMethod,
        subject: 'Booking Confirmation - Somerset Window Cleaning',
        message: 'Thank you for your booking. We will contact you within 24 hours to confirm your appointment.',
        status: 'pending',
        is_automated: true,
        template_used: 'booking_confirmation'
      }

      const { data, error } = await supabase
        .from('customer_communications')
        .insert(communicationData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending booking confirmation:', error)
      throw error
    }
  }
}

export default supabase