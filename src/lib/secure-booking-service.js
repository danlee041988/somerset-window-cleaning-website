// Secure booking service for client-side form submission
// This replaces the direct EmailJS integration with server-side API calls

export class SecureBookingService {
  static async getCSRFToken() {
    try {
      const response = await fetch('/api/booking', {
        method: 'GET',
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  }

  static async submitBooking(formData) {
    try {
      // Get CSRF token first
      const csrfToken = await this.getCSRFToken();
      
      // Add CSRF token to form data
      const submissionData = {
        ...formData,
        csrfToken,
      };
      
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(submissionData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }
      
      return {
        success: true,
        bookingReference: result.bookingReference,
        message: result.message,
      };
    } catch (error) {
      console.error('Booking submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit booking',
      };
    }
  }

  static async validatePostcode(postcode) {
    // List of covered postcodes for Somerset Window Cleaning
    const coveredPostcodes = [
      'BA1', 'BA2', 'BA3', 'BA4', 'BA5', 'BA6', 'BA7', 'BA8', 'BA9', 'BA10',
      'BA11', 'BA12', 'BA13', 'BA14', 'BA15', 'BA16', 'BA20', 'BA21', 'BA22',
      'BS25', 'BS26', 'BS27', 'BS28',
      'TA1', 'TA2', 'TA3', 'TA4', 'TA5', 'TA6', 'TA7', 'TA8', 'TA9', 'TA10',
      'TA11', 'TA12', 'TA13', 'TA14', 'TA15', 'TA16', 'TA17', 'TA18', 'TA19',
      'TA20', 'TA21', 'TA22', 'TA23', 'TA24'
    ];

    const cleanPostcode = postcode.toUpperCase().replace(/\s/g, '');
    const postcodePrefix = cleanPostcode.match(/^[A-Z]+\d+/)?.[0];
    
    return coveredPostcodes.includes(postcodePrefix);
  }

  static calculatePrice(propertyType, frequency, additionalServices = []) {
    // Base prices for window cleaning
    const basePrices = {
      'semi-2': 18,
      'semi-3': 22,
      'semi-4': 26,
      'semi-5': 30,
      'detached-2': 22,
      'detached-3': 26,
      'detached-4': 30,
      'detached-5': 35,
      'custom': null, // Quote required
      'commercial': null, // Quote required
    };

    // Frequency discounts
    const frequencyMultipliers = {
      '4weekly': 1.0,   // No discount
      '8weekly': 1.05,  // 5% premium
      '12weekly': 1.10, // 10% premium
      'onetime': 1.20,  // 20% premium
    };

    // Additional service prices
    const additionalServicePrices = {
      'gutterInternal': 45,
      'gutterExternal': 65,
      'solar': 40,
      'conservatory': 55,
    };

    const basePrice = basePrices[propertyType];
    if (!basePrice) return null; // Quote required

    const frequencyMultiplier = frequencyMultipliers[frequency] || 1.0;
    const adjustedBase = basePrice * frequencyMultiplier;

    const additionalCost = additionalServices.reduce((sum, service) => {
      return sum + (additionalServicePrices[service] || 0);
    }, 0);

    return Math.round(adjustedBase + additionalCost);
  }
}

export default SecureBookingService;