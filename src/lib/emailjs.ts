import emailjs from '@emailjs/browser'

// Initialize EmailJS with public key
emailjs.init(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || '')

// Email templates
export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'template_booking',
  CONTACT_NOTIFICATION: 'template_contact',
  ADMIN_NOTIFICATION: 'template_admin'
}

// Send booking confirmation to customer
export const sendBookingConfirmation = async (booking: {
  name: string
  email: string
  service: string
  preferred_date?: string
}) => {
  try {
    const result = await emailjs.send(
      import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
      EMAIL_TEMPLATES.BOOKING_CONFIRMATION,
      {
        to_name: booking.name,
        to_email: booking.email,
        service: booking.service,
        date: booking.preferred_date || 'To be confirmed',
        company_name: 'Somerset Window Cleaning'
      }
    )
    return result
  } catch (error) {
    console.error('Failed to send booking confirmation:', error)
    throw error
  }
}

// Send notification to admin about new booking
export const sendAdminNotification = async (booking: {
  name: string
  email: string
  phone: string
  service: string
  postcode: string
  message?: string
}) => {
  try {
    const result = await emailjs.send(
      import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
      EMAIL_TEMPLATES.ADMIN_NOTIFICATION,
      {
        customer_name: booking.name,
        customer_email: booking.email,
        customer_phone: booking.phone,
        service: booking.service,
        postcode: booking.postcode,
        message: booking.message || 'No additional message',
        admin_email: 'info@somersetwindowcleaning.co.uk'
      }
    )
    return result
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    // Don't throw - admin notification is not critical
  }
}

// Send contact form notification
export const sendContactNotification = async (contact: {
  name: string
  email: string
  message: string
}) => {
  try {
    const result = await emailjs.send(
      import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
      EMAIL_TEMPLATES.CONTACT_NOTIFICATION,
      {
        from_name: contact.name,
        from_email: contact.email,
        message: contact.message,
        admin_email: 'info@somersetwindowcleaning.co.uk'
      }
    )
    return result
  } catch (error) {
    console.error('Failed to send contact notification:', error)
    throw error
  }
}