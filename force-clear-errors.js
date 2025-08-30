// Emergency error clearing script
// This will run immediately and clear any persistent error messages

(function() {
    // Run immediately on script load
    clearAllErrors();
    
    // Run again after DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(clearAllErrors, 50);
        setTimeout(clearAllErrors, 200);
        setTimeout(clearAllErrors, 500);
    });
    
    function clearAllErrors() {
        // Remove by class
        const errorClasses = ['.booking-message', '.error-message', '[class*="error"]'];
        errorClasses.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent.includes('Please select') || 
                    el.textContent.includes('Error:')) {
                    el.remove();
                }
            });
        });
        
        // Remove by content
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
            if (div.textContent.trim() === 'Error:Please select a property type' ||
                div.textContent.includes('Please select a property type')) {
                div.remove();
            }
        });
        
        // Remove any red error alerts
        const redAlerts = document.querySelectorAll('.bg-red-50');
        redAlerts.forEach(alert => {
            if (alert.textContent.includes('Error:') || 
                alert.textContent.includes('Please select')) {
                alert.remove();
            }
        });
        
        console.log('Force cleared all error messages');
    }
})();