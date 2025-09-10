// Simplified booking form without external dependencies
console.log('Loading simplified booking form...');

// Form state management
window.formState = {
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

let currentStep = 1;
const totalSteps = 4;

// Navigation functions
window.nextStep = function() {
    console.log('nextStep called - Current step:', currentStep);
    
    // Force sync formState with current form values before validation
    if (currentStep === 1) {
        const propertyTypeSelect = document.getElementById('propertyType');
        if (propertyTypeSelect) {
            window.formState.propertyType = propertyTypeSelect.value;
            console.log('Property type:', window.formState.propertyType);
        }
    }
    
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
    }
};

window.previousStep = function() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        const formContainer = document.querySelector('.booking-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
};

function validateStep(step) {
    console.log('Validating step:', step);
    
    switch (step) {
        case 1:
            if (!window.formState.propertyType || window.formState.propertyType === '') {
                alert('Please select a property type');
                return false;
            }
            return true;
            
        case 2:
            // Additional services are optional
            return true;
            
        case 3:
            // Basic validation for required fields
            const requiredFields = ['fullName', 'email', 'address', 'city', 'postcode', 'phone'];
            const missingFields = requiredFields.filter(field => !window.formState[field]);
            
            if (missingFields.length > 0) {
                alert('Please fill in all required fields');
                return false;
            }
            return true;
            
        case 4:
            if (!window.formState.termsAgreed) {
                alert('Please agree to the terms and conditions');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

function showStep(step) {
    console.log('Showing step:', step);
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressBar();
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Initialize form handlers
function initializeForm() {
    console.log('Initializing simplified form...');
    
    // Property type handler
    const propertyTypeSelect = document.getElementById('propertyType');
    if (propertyTypeSelect) {
        propertyTypeSelect.addEventListener('change', (e) => {
            window.formState.propertyType = e.target.value;
            console.log('Property type changed:', window.formState.propertyType);
            
            // Show/hide frequency section
            const frequencySection = document.querySelector('.frequency-section');
            const priceDisplay = document.querySelector('.price-display');
            
            if (window.formState.propertyType && 
                window.formState.propertyType !== 'custom' && 
                window.formState.propertyType !== 'commercial' && 
                window.formState.propertyType !== 'general') {
                if (frequencySection) frequencySection.style.display = 'block';
                if (priceDisplay) priceDisplay.style.display = 'block';
            } else {
                if (frequencySection) frequencySection.style.display = 'none';
                if (priceDisplay) priceDisplay.style.display = 'none';
            }
        });
    }
    
    // Form inputs handler
    document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea').forEach(input => {
        input.addEventListener('change', (e) => {
            const name = e.target.name;
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            if (name && window.formState.hasOwnProperty(name)) {
                window.formState[name] = value;
                console.log(`${name} changed:`, value);
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
} else {
    initializeForm();
}

console.log('Simplified booking form loaded successfully');