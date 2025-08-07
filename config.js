// Configuration loader for environment variables
// This file handles loading configuration from environment variables or defaults

// Helper to safely read global window variables when running in a browser
const getWindowVar = (key) => (typeof window !== 'undefined' && window[key]) || undefined;

const config = {
    // EmailJS Configuration
    emailjs: {
        serviceId: getWindowVar('EMAILJS_SERVICE_ID') || process.env.EMAILJS_SERVICE_ID || 'service_dsxv0ig',
        templateId: getWindowVar('EMAILJS_TEMPLATE_ID') || process.env.EMAILJS_TEMPLATE_ID || 'template_loh8t5j',
        publicKey: getWindowVar('EMAILJS_PUBLIC_KEY') || process.env.EMAILJS_PUBLIC_KEY || 'DVzUcK_kOKQ96JOtk'
    },

    // reCAPTCHA Configuration
    recaptcha: {
        siteKey: getWindowVar('RECAPTCHA_SITE_KEY') || process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    },

    // API Configuration
    api: {
        url: getWindowVar('API_URL') || process.env.API_URL || 'https://window-cleaning-booking-system-6k15.vercel.app'
    },
    
    // Form Configuration
    form: {
        // Timeouts in milliseconds
        errorMessageDuration: 15000, // 15 seconds instead of 10
        successMessageDuration: 5000, // 5 seconds
        debounceDelay: 300, // 300ms for input validation
        networkTimeout: 30000, // 30 seconds
        maxRetries: 3
    },
    
    // Validation patterns
    validation: {
        // Updated phone regex to accept various formats
        phonePattern: /^(?:\+?44\s?|0)(?:\d\s?){9,10}$/,
        // Email pattern
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        // UK postcode pattern
        postcodePattern: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i
    }
};

// Helper function to check if all required config is present
config.isConfigured = function() {
    const required = [
        this.emailjs.serviceId,
        this.emailjs.templateId,
        this.emailjs.publicKey,
        this.recaptcha.siteKey
    ];
    
    return required.every(value => value && value !== '');
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
  }
