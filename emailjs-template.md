# EmailJS Template Configuration

This document describes the EmailJS email template that needs to be created for the booking form.

## Template Name
`template_booking`

## Template Variables

The following variables will be sent from the booking form and should be included in your EmailJS template:

### Customer Information
- `{{customer_name}}` - Full name of the customer
- `{{customer_email}}` - Customer's email address
- `{{customer_phone}}` - Customer's phone number
- `{{customer_address}}` - Full address including city and postcode

### Service Details
- `{{property_type}}` - Type of property (e.g., "Semi-detached House (3 bed)")
- `{{frequency}}` - Cleaning frequency (e.g., "Every 4 Weeks")
- `{{additional_services}}` - Additional services selected (comma-separated)
- `{{estimated_price}}` - Estimated price per clean

### Booking Information
- `{{booking_reference}}` - Unique booking reference (e.g., "SWC241230001")
- `{{booking_date}}` - Date/time when booking was submitted
- `{{preferred_date}}` - Customer's preferred start date
- `{{contact_method}}` - Preferred contact method (email/phone/text)
- `{{notes}}` - Any additional notes from the customer

## Suggested Email Template

```html
Subject: Booking Confirmation - {{booking_reference}} - Somerset Window Cleaning

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .highlight { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Somerset Window Cleaning</h1>
            <p>Professional Window Cleaning Since 2019</p>
        </div>
        
        <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear {{customer_name}},</p>
            <p>Thank you for choosing Somerset Window Cleaning! We've received your booking and will contact you within 24 hours to confirm your appointment.</p>
            
            <div class="details">
                <h3>Booking Details</h3>
                <table>
                    <tr>
                        <td><strong>Booking Reference:</strong></td>
                        <td class="highlight">{{booking_reference}}</td>
                    </tr>
                    <tr>
                        <td><strong>Property Type:</strong></td>
                        <td>{{property_type}}</td>
                    </tr>
                    <tr>
                        <td><strong>Frequency:</strong></td>
                        <td>{{frequency}}</td>
                    </tr>
                    <tr>
                        <td><strong>Estimated Price:</strong></td>
                        <td class="highlight">{{estimated_price}}</td>
                    </tr>
                    <tr>
                        <td><strong>Additional Services:</strong></td>
                        <td>{{additional_services}}</td>
                    </tr>
                    <tr>
                        <td><strong>Preferred Date:</strong></td>
                        <td>{{preferred_date}}</td>
                    </tr>
                </table>
            </div>
            
            <div class="details">
                <h3>Your Contact Information</h3>
                <table>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>{{customer_name}}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>{{customer_email}}</td>
                    </tr>
                    <tr>
                        <td><strong>Phone:</strong></td>
                        <td>{{customer_phone}}</td>
                    </tr>
                    <tr>
                        <td><strong>Address:</strong></td>
                        <td>{{customer_address}}</td>
                    </tr>
                    <tr>
                        <td><strong>Preferred Contact:</strong></td>
                        <td>{{contact_method}}</td>
                    </tr>
                </table>
            </div>
            
            <h3>What happens next?</h3>
            <ol>
                <li>We'll contact you within 24 hours to confirm your appointment</li>
                <li>We'll arrange a suitable date and time that works for you</li>
                <li>Our professional team will arrive as scheduled</li>
                <li>Payment is due on completion of the work</li>
            </ol>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Need to contact us?</h4>
                <p>
                    📞 Phone: 01458 860339<br>
                    📧 Email: info@somersetwindowcleaning.co.uk<br>
                    💬 WhatsApp: 07415 526331
                </p>
            </div>
            
            <p>Thank you for choosing Somerset Window Cleaning!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Somerset Window Cleaning | VAT: 359 427 172<br>
                13 Rockhaven Business Centre, Gravenchon Way, Street, Somerset BA16 0HW<br>
                Booking submitted: {{booking_date}}
            </p>
        </div>
    </div>
</body>
</html>
```

## Setup Instructions

1. Log in to your EmailJS account at https://dashboard.emailjs.com/
2. Create a new email template
3. Set the template ID to `template_booking`
4. Copy the HTML template above into the content section
5. Configure the "To" field to send to both:
   - Customer: `{{customer_email}}`
   - Business: `info@somersetwindowcleaning.co.uk`
6. Set up auto-response if needed
7. Test the template with sample data

## Testing the Integration

After setting up the template, test the booking form to ensure:
- Emails are sent successfully
- All variables are populated correctly
- Formatting appears as expected
- Both customer and business receive the email