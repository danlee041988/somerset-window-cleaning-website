// =====================================================
// Advanced Booking Form Implementation for Somerset Window Cleaning
// Adapted from the original CascadeProjects booking system
// =====================================================

// Import Supabase client and booking service
import { BookingService } from '../lib/supabase.js';
import { sendBookingEmail } from '../lib/emailjs-service.js';

// Form state management - initialize immediately to prevent undefined errors
let formState = {
    propertyType: '',
    frequency: '4weekly',
    additionalServices: [],
    fullName: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    contactMethod: 'email',
    preferredDate: '',
    notes: '',
    termsAgreed: false
};

// Make formState globally accessible for debugging
window.formState = formState;

let currentStep = 1;
const totalSteps = 4;

// Pricing data based on site configuration
const propertyPrices = {
    'semi-2': 20,
    'semi-3': 25,
    'semi-4': 30,
    'semi-5': 32,
    'detached-2': 25,
    'detached-3': 30,
    'detached-4': 35,
    'detached-5': 40,
    'custom': 0, // Quote required
    'commercial': 0, // Quote required
    'general': 0 // General enquiry
};

const frequencyAdjustments = {
    '4weekly': 0,
    '8weekly': 3,
    '12weekly': 5,
    'onetime': 20
};

// Postcode schedule groups for Somerset areas
const postcodeSchedules = {
    'BA1': { day: 'Monday', week: 1 },
    'BA2': { day: 'Tuesday', week: 1 },
    'BA3': { day: 'Wednesday', week: 1 },
    'BA4': { day: 'Thursday', week: 1 },
    'BA5': { day: 'Friday', week: 1 },
    'BA6': { day: 'Monday', week: 2 },
    'BA7': { day: 'Tuesday', week: 2 },
    'BA8': { day: 'Wednesday', week: 2 },
    'BA9': { day: 'Thursday', week: 2 },
    'BA10': { day: 'Friday', week: 2 },
    'BA11': { day: 'Monday', week: 3 },
    'BA16': { day: 'Tuesday', week: 3 },
    'BA20': { day: 'Wednesday', week: 3 },
    'BA21': { day: 'Thursday', week: 3 },
    'BA22': { day: 'Friday', week: 3 },
    'TA1': { day: 'Monday', week: 4 },
    'TA2': { day: 'Tuesday', week: 4 },
    'TA6': { day: 'Wednesday', week: 4 },
    'TA7': { day: 'Thursday', week: 4 },
    'TA8': { day: 'Friday', week: 4 },
    'TA9': { day: 'Monday', week: 1 },
    'TA10': { day: 'Tuesday', week: 1 },
    'TA11': { day: 'Wednesday', week: 1 },
    'TA12': { day: 'Thursday', week: 1 },
    'BS21': { day: 'Friday', week: 1 },
    'BS22': { day: 'Monday', week: 2 },
    'BS23': { day: 'Tuesday', week: 2 },
    'BS24': { day: 'Wednesday', week: 2 },
    'BS25': { day: 'Thursday', week: 2 },
    'DT9': { day: 'Friday', week: 2 }
};

// reCAPTCHA Configuration
const RECAPTCHA_CONFIG = {
    SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Test key - replace with actual site key
};

let recaptchaLoaded = false;
let recaptchaWidgetId = null;

// Module loading notification will happen after functions are defined

// Initialize all form functionality
function initializeBookingForm() {
    console.log('Initializing booking form...');
    
    // Clear any existing error messages on page load
    removeExistingMessages();
    clearAllFieldErrors();
    
    // Force clear any persistent error after a short delay
    setTimeout(() => {
        removeExistingMessages();
        clearAllFieldErrors();
    }, 500);
    
    // Property type change handler
    const propertyTypeSelect = document.getElementById('propertyType');
    if (propertyTypeSelect) {
        // Always sync formState with current dropdown value (even if empty)
        formState.propertyType = propertyTypeSelect.value || '';
        console.log('Initial property type set to:', formState.propertyType);
        
        if (propertyTypeSelect.value) {
            updateStep1Display();
        }
        
        propertyTypeSelect.addEventListener('change', (e) => {
            console.log('Property type changed from', formState.propertyType, 'to', e.target.value);
            formState.propertyType = e.target.value || '';
            
            // Clear any existing error messages when user makes a selection
            if (e.target.value) {
                removeExistingMessages();
                clearAllFieldErrors();
            }
            
            updateStep1Display();
        });
        
        // Also add input event listener for better tracking
        propertyTypeSelect.addEventListener('input', (e) => {
            formState.propertyType = e.target.value || '';
            console.log('Property type input event - value:', formState.propertyType);
        });
    } else {
        console.warn('Property type select element not found');
    }

    // Frequency change handler
    document.querySelectorAll('input[name="frequency"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formState.frequency = e.target.value;
            updateFrequencySelection();
            updatePriceDisplay();
        });
    });

    // Additional services handler
    document.querySelectorAll('input[name="additionalServices"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                formState.additionalServices.push(e.target.value);
            } else {
                formState.additionalServices = formState.additionalServices.filter(
                    service => service !== e.target.value
                );
            }
            updateGutterOffer();
            updateAdditionalServiceSelection();
        });
    });

    // Form inputs handler with real-time validation
    document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea').forEach(input => {
        input.addEventListener('change', (e) => {
            const name = e.target.name;
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            if (name && name !== 'additionalServices' && name !== 'frequency') {
                formState[name] = value;
            }
            
            // Real-time validation
            if (name === 'phone') {
                validateMobileNumber(e.target);
            } else if (name === 'postcode') {
                validatePostcode(e.target);
                updateAvailableDates();
            } else if (name === 'email') {
                validateEmail(e.target);
            }
        });
        
        // Also validate on blur for better UX
        if (['phone', 'postcode', 'email'].includes(input.name)) {
            input.addEventListener('blur', (e) => {
                if (e.target.name === 'phone') {
                    validateMobileNumber(e.target);
                } else if (e.target.name === 'postcode') {
                    validatePostcode(e.target);
                } else if (e.target.name === 'email') {
                    validateEmail(e.target);
                }
            });
        }
    });

    // Form submission handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmission);
    }

    // Initialize reCAPTCHA
    loadRecaptcha();
}

// Update Step 1 display based on property selection
function updateStep1Display() {
    const frequencySection = document.querySelector('.frequency-section');
    const priceDisplay = document.querySelector('.price-display');
    
    console.log('updateStep1Display called with propertyType:', formState.propertyType);
    
    if (formState.propertyType && 
        formState.propertyType !== 'custom' && 
        formState.propertyType !== 'commercial' && 
        formState.propertyType !== 'general') {
        if (frequencySection) frequencySection.style.display = 'block';
        if (priceDisplay) priceDisplay.style.display = 'block';
        updatePriceDisplay();
        updateFrequencySelection(); // Ensure frequency is visually selected
    } else {
        if (frequencySection) frequencySection.style.display = 'none';
        if (priceDisplay) priceDisplay.style.display = 'none';
    }
}

// Update frequency selection visual state
function updateFrequencySelection() {
    document.querySelectorAll('.frequency-option').forEach(option => {
        const input = option.querySelector('input[name="frequency"]');
        const content = option.querySelector('.frequency-content');
        if (input.checked) {
            content.style.borderColor = '#dc2626';
            content.style.backgroundColor = '#fef2f2';
        } else {
            content.style.borderColor = '#d1d5db';
            content.style.backgroundColor = 'white';
        }
    });
}

// Update additional service selection visual state
function updateAdditionalServiceSelection() {
    document.querySelectorAll('.service-card-option').forEach(option => {
        const input = option.querySelector('input[name="additionalServices"]');
        const content = option.querySelector('.service-card-content');
        const icon = content.querySelector('svg');
        
        if (input.checked) {
            content.style.borderColor = '#dc2626';
            content.style.backgroundColor = '#fef2f2';
            if (icon) icon.style.color = '#dc2626';
        } else {
            content.style.borderColor = '#d1d5db';
            content.style.backgroundColor = 'white';
            if (icon) icon.style.color = '#9ca3af';
        }
    });
}

// Update price display
function updatePriceDisplay() {
    const basePrice = propertyPrices[formState.propertyType] || 0;
    const adjustment = frequencyAdjustments[formState.frequency] || 0;
    const totalPrice = basePrice + adjustment;
    
    const priceElement = document.getElementById('step1Price');
    if (priceElement) {
        priceElement.textContent = basePrice > 0 ? `£${totalPrice}` : 'Quote Required';
    }
}

// Update gutter offer display
function updateGutterOffer() {
    const hasInternal = formState.additionalServices.includes('gutterInternal');
    const hasExternal = formState.additionalServices.includes('gutterExternal');
    const offerDiv = document.getElementById('gutterOffer');
    
    if (offerDiv) {
        offerDiv.style.display = hasInternal && hasExternal ? 'block' : 'none';
    }
}

// Update available dates based on postcode
function updateAvailableDates() {
    const postcode = formState.postcode.toUpperCase();
    const dateSelect = document.getElementById('preferredDate');
    const dateGroup = document.getElementById('preferredDateGroup');
    
    if (!dateSelect || !dateGroup) return;
    
    // Only show for standard bookings
    if (formState.propertyType === 'custom' || 
        formState.propertyType === 'commercial' || 
        formState.propertyType === 'general') {
        dateGroup.style.display = 'none';
        return;
    }
    
    // Find matching schedule
    let schedule = null;
    for (const [prefix, data] of Object.entries(postcodeSchedules)) {
        if (postcode.startsWith(prefix)) {
            schedule = data;
            break;
        }
    }
    
    if (!schedule) {
        dateGroup.style.display = 'none';
        return;
    }
    
    dateGroup.style.display = 'block';
    dateSelect.innerHTML = '<option value="">Select available date</option>';
    
    // Generate next 8 available dates
    const dates = getNextAvailableDates(schedule.day, schedule.week, 8);
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date.toISOString().split('T')[0];
        option.textContent = date.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        dateSelect.appendChild(option);
    });
}

// Generate available dates based on schedule
function getNextAvailableDates(dayName, weekNumber, count) {
    const dates = [];
    const dayMap = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5
    };
    const targetDay = dayMap[dayName];
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Skip to next occurrence of target day
    while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Find dates that match the week pattern
    while (dates.length < count) {
        const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
        if (weekOfMonth === weekNumber || (weekNumber === 4 && weekOfMonth >= 4)) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 28); // Jump 4 weeks
    }
    
    return dates;
}

// Navigation functions
const realNextStep = function() {
    console.log('realNextStep called - Current step:', currentStep);
    
    // Force sync formState with current form values before validation
    if (currentStep === 1) {
        const propertyTypeSelect = document.getElementById('propertyType');
        if (propertyTypeSelect) {
            formState.propertyType = propertyTypeSelect.value;
            console.log('Force-synced property type:', formState.propertyType);
        }
    }
    
    console.log('FormState before validation:', formState);
    
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            // Smooth scroll to top of form
            const formContainer = document.querySelector('.booking-form-container');
            if (formContainer) {
                formContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    } else {
        console.log('Validation failed for step:', currentStep);
    }
};

const realPreviousStep = function() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        document.querySelector('.booking-form-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
};

// Store real functions globally
window._realNextStep = realNextStep;
window._realPreviousStep = realPreviousStep;

// Replace placeholder functions
window.nextStep = realNextStep;
window.previousStep = realPreviousStep;

// Notify that module is loaded
if (window._onBookingFormModuleLoaded) {
    window._onBookingFormModuleLoaded();
}

// Show specific step
function showStep(step) {
    // Clear any field validation errors when moving between steps
    clearAllFieldErrors();
    
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressBar();
    
    if (step === 4) {
        updateReviewSummary();
    }
}

// Update progress bar
function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Validate current step
function validateStep(step) {
    switch (step) {
        case 1:
            // Get current dropdown value and sync with formState
            const propertyTypeSelect = document.getElementById('propertyType');
            if (propertyTypeSelect) {
                // Force read the current value from the DOM
                const currentValue = propertyTypeSelect.value;
                formState.propertyType = currentValue;
                
                console.log('Validating step 1 - dropdown element exists:', !!propertyTypeSelect);
                console.log('Current dropdown value:', currentValue);
                console.log('FormState property type:', formState.propertyType);
                console.log('Selected index:', propertyTypeSelect.selectedIndex);
                console.log('Selected option text:', propertyTypeSelect.options[propertyTypeSelect.selectedIndex]?.text);
            }
            
            if (!formState.propertyType || formState.propertyType === '') {
                showErrorMessage('Please select a property type');
                // Focus the dropdown to help user
                if (propertyTypeSelect) {
                    propertyTypeSelect.focus();
                    propertyTypeSelect.classList.add('border-red-500');
                }
                return false;
            }
            
            // Remove error styling if validation passes
            if (propertyTypeSelect) {
                propertyTypeSelect.classList.remove('border-red-500');
            }
            return true;
            
        case 2:
            // Additional services are optional
            return true;
            
        case 3:
            const requiredFields = ['fullName', 'email', 'address', 'city', 'postcode', 'phone'];
            const missingFields = requiredFields.filter(field => !formState[field]);
            
            if (missingFields.length > 0) {
                showErrorMessage('Please fill in all required fields');
                return false;
            }
            
            // Validate all fields using real-time validation functions
            const emailInput = document.querySelector('input[name="email"]');
            const phoneInput = document.querySelector('input[name="phone"]');
            const postcodeInput = document.querySelector('input[name="postcode"]');
            
            let isValid = true;
            
            if (!validateEmail(emailInput)) isValid = false;
            if (!validateMobileNumber(phoneInput)) isValid = false;
            if (!validatePostcode(postcodeInput)) isValid = false;
            
            return isValid;
            
        case 4:
            if (!formState.termsAgreed) {
                showErrorMessage('Please agree to the terms and conditions');
                return false;
            }
            
            // Check reCAPTCHA if available
            const recaptchaResponse = getRecaptchaResponse();
            if (window.grecaptcha && recaptchaWidgetId !== null && !recaptchaResponse) {
                showErrorMessage('Please complete the reCAPTCHA verification');
                return false;
            }
            
            return true;
            
        default:
            return true;
    }
}

// Update review summary
function updateReviewSummary() {
    // Service summary
    const serviceSummary = document.getElementById('serviceSummary');
    if (serviceSummary) {
        const propertyTypeText = document.querySelector(`#propertyType option[value="${formState.propertyType}"]`)?.textContent || '';
        const basePrice = propertyPrices[formState.propertyType] || 0;
        const adjustment = frequencyAdjustments[formState.frequency] || 0;
        const totalPrice = basePrice + adjustment;
        
        let serviceHTML = `<p><strong>Property:</strong> ${propertyTypeText}</p>`;
        if (basePrice > 0) {
            serviceHTML += `<p><strong>Frequency:</strong> ${getFrequencyText(formState.frequency)}</p>`;
            serviceHTML += `<p><strong>Window Cleaning Price:</strong> £${totalPrice} per clean</p>`;
        }
        
        if (formState.additionalServices.length > 0) {
            serviceHTML += '<p><strong>Additional Services:</strong></p><ul class="list-disc list-inside ml-4">';
            formState.additionalServices.forEach(service => {
                serviceHTML += `<li>${getServiceText(service)}</li>`;
            });
            serviceHTML += '</ul>';
        }
        
        if (formState.preferredDate) {
            const date = new Date(formState.preferredDate);
            serviceHTML += `<p><strong>Preferred Start Date:</strong> ${date.toLocaleDateString('en-GB')}</p>`;
        }
        
        serviceSummary.innerHTML = serviceHTML;
    }
    
    // Contact summary
    const contactSummary = document.getElementById('contactSummary');
    if (contactSummary) {
        contactSummary.innerHTML = `
            <p><strong>Name:</strong> ${formState.fullName}</p>
            <p><strong>Email:</strong> ${formState.email}</p>
            <p><strong>Phone:</strong> ${formState.phone}</p>
            <p><strong>Address:</strong> ${formState.address}, ${formState.city}, ${formState.postcode}</p>
            <p><strong>Contact Method:</strong> ${formState.contactMethod}</p>
        `;
    }
    
    // Price summary
    const priceSummary = document.getElementById('priceSummary');
    if (priceSummary) {
        const basePrice = propertyPrices[formState.propertyType] || 0;
        if (basePrice > 0) {
            const adjustment = frequencyAdjustments[formState.frequency] || 0;
            const totalPrice = basePrice + adjustment;
            
            let priceHTML = `<div class="text-2xl font-bold text-red-600 mb-2">Window Cleaning: £${totalPrice} per clean</div>`;
            
            if (formState.additionalServices.includes('gutterInternal') && 
                formState.additionalServices.includes('gutterExternal')) {
                priceHTML += '<div class="bg-green-50 border border-green-200 rounded p-3 mt-2"><span class="text-green-800 font-semibold">🎉 Special Offer: Windows cleaned FREE with both gutter services!</span></div>';
            }
            
            priceSummary.innerHTML = priceHTML;
        } else {
            priceSummary.innerHTML = '<div class="text-lg font-semibold text-gray-700">We will provide a custom quote for your requirements.</div>';
        }
    }
}

// Helper functions for text display
function getFrequencyText(frequency) {
    const frequencyMap = {
        '4weekly': 'Every 4 Weeks',
        '8weekly': 'Every 8 Weeks',
        '12weekly': 'Every 12 Weeks',
        'onetime': 'One-time Clean'
    };
    return frequencyMap[frequency] || frequency;
}

function getServiceText(service) {
    const serviceMap = {
        'gutterInternal': 'Gutter Clearing (Internal)',
        'gutterExternal': 'Gutter, Fascia & Soffit Cleaning',
        'solar': 'Solar Panel Cleaning',
        'conservatory': 'Conservatory Roof Cleaning'
    };
    return serviceMap[service] || service;
}

// Form submission handler
async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateStep(4)) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...';
    submitBtn.disabled = true;
    
    // Prepare data for submission
    const bookingData = {
        fullName: formState.fullName,
        email: formState.email,
        phone: formState.phone,
        address: formState.address,
        city: formState.city,
        postcode: formState.postcode,
        propertyType: formState.propertyType,
        frequency: formState.frequency,
        preferredDate: formState.preferredDate || null,
        additionalServices: formState.additionalServices,
        estimatedPrice: propertyPrices[formState.propertyType] ? 
            propertyPrices[formState.propertyType] + (frequencyAdjustments[formState.frequency] || 0) : null,
        contactMethod: formState.contactMethod,
        notes: formState.notes
    };
    
    try {
        // First, try to send email via EmailJS
        console.log('Sending booking email...');
        const emailResult = await sendBookingEmail(bookingData);
        
        if (emailResult.success) {
            // Show success message with booking reference
            showSuccessMessage(`Thank you for your booking, ${formState.fullName}! Your booking reference is: ${emailResult.reference}. We'll contact you within 24 hours to confirm your appointment.`);
            
            // Reset form
            resetForm();
            
            // Try to save to Supabase in the background (non-blocking)
            BookingService.submitBooking(bookingData).catch(err => {
                console.warn('Failed to save to database:', err);
            });
        } else {
            throw new Error(emailResult.error || 'Failed to send booking email');
        }
        
    } catch (error) {
        console.error('Booking submission error:', error);
        
        // Fallback: Try Supabase if EmailJS fails
        try {
            console.log('Attempting fallback submission via Supabase...');
            const result = await BookingService.submitBooking(bookingData);
            
            if (result.success) {
                showSuccessMessage(`Thank you for your booking, ${formState.fullName}! Your booking reference is: ${result.reference}. We'll contact you within 24 hours to confirm your appointment.`);
                resetForm();
            } else {
                throw new Error(result.error || 'Unknown booking error');
            }
        } catch (fallbackError) {
            console.error('Fallback submission error:', fallbackError);
            
            // Show generic error message
            showErrorMessage('There was an error submitting your booking. Please try again or call us directly at 01458 860339.');
        }
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Reset form to initial state
function resetForm() {
    document.getElementById('bookingForm').reset();
    Object.keys(formState).forEach(key => {
        if (key === 'additionalServices') {
            formState[key] = [];
        } else if (key === 'frequency') {
            formState[key] = '4weekly';
        } else if (key === 'contactMethod') {
            formState[key] = 'email';
        } else if (key === 'termsAgreed') {
            formState[key] = false;
        } else {
            formState[key] = '';
        }
    });
    currentStep = 1;
    showStep(1);
    resetRecaptcha();
}

// Validation functions
function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const value = input.value.trim();
    
    removeFieldError(input);
    input.classList.remove('border-red-500', 'border-green-500');
    
    if (value && !emailRegex.test(value)) {
        input.classList.add('border-red-500');
        showFieldError(input, 'Please enter a valid email address');
        return false;
    } else if (value) {
        input.classList.add('border-green-500');
        return true;
    }
    return true;
}

function validateMobileNumber(input) {
    // UK phone regex - accepts mobile (07) and landline (01/02/03) numbers
    const ukPhoneRegex = /^(?:(?:\+44\s?|0)(?:1\d{8,9}|2\d{9}|3\d{9}|7\d{9}|8\d{9}))$/;
    const value = input.value.trim().replace(/[\s\-\(\)]/g, '');
    
    removeFieldError(input);
    input.classList.remove('border-red-500', 'border-green-500');
    
    if (value && !ukPhoneRegex.test(value)) {
        input.classList.add('border-red-500');
        showFieldError(input, 'Please enter a valid UK phone number');
        return false;
    } else if (value) {
        input.classList.add('border-green-500');
        return true;
    }
    return true;
}

function validatePostcode(input) {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    const value = input.value.trim();
    
    removeFieldError(input);
    input.classList.remove('border-red-500', 'border-green-500');
    
    if (value && !postcodeRegex.test(value)) {
        input.classList.add('border-red-500');
        showFieldError(input, 'Please enter a valid UK postcode (e.g., BA16 0HW)');
        return false;
    } else if (value) {
        input.classList.add('border-green-500');
        return true;
    }
    return true;
}

// Error and success message functions
function showErrorMessage(message) {
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message error-message mb-6';
    messageDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <strong>Error:</strong> ${message}
            </div>
        </div>
    `;
    
    const form = document.getElementById('bookingForm');
    const currentStepDiv = document.querySelector('.form-step.active');
    
    // Insert error at the top of the current step, not the entire form
    if (currentStepDiv) {
        const firstChild = currentStepDiv.querySelector('.max-w-4xl') || currentStepDiv.firstChild;
        currentStepDiv.insertBefore(messageDiv, firstChild);
    } else {
        form.insertBefore(messageDiv, form.firstChild);
    }
    
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 10000);
}

function showSuccessMessage(message) {
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'booking-message success-message mb-6';
    messageDiv.innerHTML = `
        <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <strong>Success:</strong> ${message}
            </div>
        </div>
    `;
    
    const form = document.getElementById('bookingForm');
    form.insertBefore(messageDiv, form.firstChild);
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeExistingMessages() {
    // Remove all booking error messages specifically
    const existingMessages = document.querySelectorAll('.booking-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Also look for any divs with error text
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
        if (div.textContent.includes('Please select a property type') && 
            div.classList.contains('bg-red-50')) {
            div.remove();
        }
    });
}

function showFieldError(input, message) {
    removeFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function removeFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearAllFieldErrors() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('border-red-500', 'border-green-500');
    });
}

// reCAPTCHA Functions
function loadRecaptcha() {
    if (recaptchaLoaded) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    window.onRecaptchaLoad = function() {
        recaptchaLoaded = true;
        initRecaptchaWidget();
    };
}

function initRecaptchaWidget() {
    const recaptchaContainer = document.getElementById('recaptcha');
    if (recaptchaContainer && window.grecaptcha) {
        try {
            recaptchaWidgetId = window.grecaptcha.render(recaptchaContainer, {
                'sitekey': RECAPTCHA_CONFIG.SITE_KEY,
                'theme': 'light',
                'size': 'normal'
            });
        } catch (error) {
            console.error('reCAPTCHA render error:', error);
            recaptchaContainer.innerHTML = '<p class="text-gray-600 p-4 bg-gray-50 border rounded">reCAPTCHA verification required for form submission</p>';
        }
    }
}

function getRecaptchaResponse() {
    if (window.grecaptcha && recaptchaWidgetId !== null) {
        return window.grecaptcha.getResponse(recaptchaWidgetId);
    }
    return null;
}

function resetRecaptcha() {
    if (window.grecaptcha && recaptchaWidgetId !== null) {
        window.grecaptcha.reset(recaptchaWidgetId);
    }
}

// Debug function to check form state
window.debugFormState = function() {
    console.log('Current form state:', formState);
    console.log('Property type element value:', document.getElementById('propertyType')?.value);
    console.log('Current step:', currentStep);
    const errorElements = document.querySelectorAll('.booking-message, .error-message');
    console.log('Error elements found:', errorElements.length);
    errorElements.forEach((el, i) => console.log(`Error ${i}:`, el.textContent));
};

// Initialize the form when module loads
console.log('Booking form JavaScript loaded successfully');
console.log('Form state initialized:', formState);

// Initialize immediately
initializeBookingForm();

// CRITICAL: Call the module loaded callback to process any queued actions
if (window._onBookingFormModuleLoaded) {
    console.log('Calling module loaded callback');
    window._onBookingFormModuleLoaded();
}