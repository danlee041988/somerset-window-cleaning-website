// Email notification service for booking confirmations
// This can be integrated with various email providers (SendGrid, Resend, Nodemailer, etc.)

export class EmailService {
  /**
   * Send booking confirmation email to customer
   */
  static async sendBookingConfirmation(bookingData, customerData) {
    try {
      // Prepare email content
      const emailContent = this.generateBookingConfirmationHTML(bookingData, customerData);
      
      // In a production environment, you would integrate with an email service
      // For now, we'll log the email content and simulate sending
      console.log('📧 Email Notification Service');
      console.log('To:', customerData.email);
      console.log('Subject: Booking Confirmation - Somerset Window Cleaning');
      console.log('Content:', emailContent);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: 'sim_' + Date.now(),
        message: 'Booking confirmation email queued for delivery'
      };
      
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send booking confirmation SMS to customer
   */
  static async sendBookingConfirmationSMS(bookingData, customerData) {
    try {
      const smsContent = this.generateBookingConfirmationSMS(bookingData, customerData);
      
      console.log('📱 SMS Notification Service');
      console.log('To:', customerData.phone);
      console.log('Message:', smsContent);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        messageId: 'sms_sim_' + Date.now(),
        message: 'Booking confirmation SMS queued for delivery'
      };
      
    } catch (error) {
      console.error('SMS service error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate HTML email content for booking confirmation
   */
  static generateBookingConfirmationHTML(bookingData, customerData) {
    const reference = JSON.parse(bookingData.internal_notes).booking_reference;
    const estimatedPrice = bookingData.total_price;
    const bookingDetails = JSON.parse(bookingData.internal_notes);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Somerset Window Cleaning</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Professional Window Cleaning Since 2019</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #dc2626; margin-top: 0;">Booking Confirmation</h2>
            <p>Dear ${customerData.first_name},</p>
            <p>Thank you for choosing Somerset Window Cleaning! We've received your booking and will contact you within 24 hours to confirm your appointment.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td>
                        <td style="padding: 8px 0;">${reference}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Service:</td>
                        <td style="padding: 8px 0;">Window Cleaning</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Property Type:</td>
                        <td style="padding: 8px 0;">${bookingDetails.property_type}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Frequency:</td>
                        <td style="padding: 8px 0;">${bookingDetails.frequency}</td>
                    </tr>
                    ${estimatedPrice ? `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Estimated Price:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">£${estimatedPrice}</td>
                    </tr>
                    ` : ''}
                    ${bookingData.booking_date ? `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Preferred Start Date:</td>
                        <td style="padding: 8px 0;">${new Date(bookingData.booking_date).toLocaleDateString('en-GB')}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            ${bookingDetails.additional_services && bookingDetails.additional_services.length > 0 ? `
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Additional Services</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    ${bookingDetails.additional_services.map(service => `<li>${service}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <h3 style="color: #dc2626;">What happens next?</h3>
            <ol style="padding-left: 20px;">
                <li>We'll contact you within 24 hours to confirm your appointment</li>
                <li>We'll arrange a suitable date and time that works for you</li>
                <li>Our professional team will arrive as scheduled</li>
                <li>Payment is due on completion of the work</li>
            </ol>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1976d2;">Need to contact us?</h4>
                <p style="margin-bottom: 0;">
                    📞 <strong>Phone:</strong> 01458 860339<br>
                    📧 <strong>Email:</strong> info@somersetwindowcleaning.co.uk<br>
                    💬 <strong>WhatsApp:</strong> 07415 526331
                </p>
            </div>
            
            <p>Thank you for choosing Somerset Window Cleaning!</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                Somerset Window Cleaning | VAT: 359 427 172<br>
                13 Rockhaven Business Centre, Gravenchon Way, Street, Somerset BA16 0HW
            </p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate SMS content for booking confirmation
   */
  static generateBookingConfirmationSMS(bookingData, customerData) {
    const reference = JSON.parse(bookingData.internal_notes).booking_reference;
    const estimatedPrice = bookingData.total_price;
    
    let smsContent = `Somerset Window Cleaning: Booking confirmed! Reference: ${reference}. `;
    
    if (estimatedPrice) {
      smsContent += `Estimated cost: £${estimatedPrice}. `;
    }
    
    smsContent += `We'll contact you within 24hrs to schedule. Questions? Call 01458 860339`;
    
    return smsContent;
  }

  /**
   * Send internal notification to business owner
   */
  static async sendInternalNotification(bookingData, customerData) {
    try {
      const emailContent = this.generateInternalNotificationHTML(bookingData, customerData);
      
      console.log('🔔 Internal Notification Service');
      console.log('To: info@somersetwindowcleaning.co.uk');
      console.log('Subject: New Booking Received - ' + JSON.parse(bookingData.internal_notes).booking_reference);
      console.log('Content:', emailContent);
      
      return {
        success: true,
        messageId: 'internal_' + Date.now(),
        message: 'Internal notification sent to business owner'
      };
      
    } catch (error) {
      console.error('Internal notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate internal notification email for business owner
   */
  static generateInternalNotificationHTML(bookingData, customerData) {
    const reference = JSON.parse(bookingData.internal_notes).booking_reference;
    const estimatedPrice = bookingData.total_price;
    const bookingDetails = JSON.parse(bookingData.internal_notes);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>New Booking Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🎉 New Booking Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Reference: ${reference}</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #1e40af; margin-top: 0;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 5px;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Name:</td>
                    <td style="padding: 10px;">${customerData.first_name} ${customerData.last_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Email:</td>
                    <td style="padding: 10px;"><a href="mailto:${customerData.email}">${customerData.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Phone:</td>
                    <td style="padding: 10px;"><a href="tel:${customerData.phone}">${customerData.phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Address:</td>
                    <td style="padding: 10px;">${customerData.address}, ${customerData.city}, ${customerData.postcode}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Property Type:</td>
                    <td style="padding: 10px;">${bookingDetails.property_type}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Frequency:</td>
                    <td style="padding: 10px;">${bookingDetails.frequency}</td>
                </tr>
                ${estimatedPrice ? `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; font-weight: bold;">Estimated Price:</td>
                    <td style="padding: 10px; font-weight: bold; color: #059669;">£${estimatedPrice}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Preferred Contact:</td>
                    <td style="padding: 10px;">${bookingDetails.contact_method}</td>
                </tr>
            </table>
            
            ${bookingDetails.additional_services && bookingDetails.additional_services.length > 0 ? `
            <h3 style="color: #1e40af;">Additional Services Requested</h3>
            <ul style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                ${bookingDetails.additional_services.map(service => `<li>${service}</li>`).join('')}
            </ul>
            ` : ''}
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #92400e;">Action Required</h4>
                <p style="margin-bottom: 0;">Contact the customer within 24 hours to confirm appointment details and schedule the service.</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                Booking submitted at: ${new Date(bookingDetails.form_submitted_at).toLocaleString('en-GB')}
            </p>
        </div>
    </body>
    </html>
    `;
  }
}

export default EmailService;