/**
 * Client-Side Validation Utilities
 * Provides reusable validation functions for forms
 */

const Validator = {
  /**
   * Email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Phone number validation (Indian format)
   */
  isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  /**
   * Password strength validation
   */
  isStrongPassword(password) {
    return {
      isValid: password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password),
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    };
  },

  /**
   * Name validation
   */
  isValidName(name) {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  },

  /**
   * Age validation
   */
  isValidAge(age) {
    const numAge = parseInt(age);
    return !isNaN(numAge) && numAge >= 1 && numAge <= 120;
  },

  /**
   * Sanitize input (prevent XSS)
   */
  sanitizeInput(input) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
    };
    return String(input).replace(/[&<>"'/]/g, (s) => map[s]);
  },

  /**
   * Show validation error
   */
  showError(input, message) {
    const errorDiv = input.parentElement.querySelector('.validation-error') || 
                     document.createElement('div');
    errorDiv.className = 'validation-error text-danger small mt-1';
    errorDiv.textContent = message;
    
    if (!input.parentElement.querySelector('.validation-error')) {
      input.parentElement.appendChild(errorDiv);
    }
    
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  },

  /**
   * Show validation success
   */
  showSuccess(input) {
    const errorDiv = input.parentElement.querySelector('.validation-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  },

  /**
   * Clear validation state
   */
  clearValidation(input) {
    const errorDiv = input.parentElement.querySelector('.validation-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    
    input.classList.remove('is-invalid', 'is-valid');
  },

  /**
   * Validate form field
   */
  validateField(input) {
    const value = input.value.trim();
    const type = input.dataset.validate || input.type;
    
    if (input.hasAttribute('required') && !value) {
      this.showError(input, 'This field is required');
      return false;
    }
    
    switch(type) {
      case 'email':
        if (value && !this.isValidEmail(value)) {
          this.showError(input, 'Please enter a valid email address');
          return false;
        }
        break;
        
      case 'phone':
        if (value && !this.isValidPhone(value)) {
          this.showError(input, 'Please enter a valid 10-digit phone number');
          return false;
        }
        break;
        
      case 'password':
        if (value) {
          const result = this.isStrongPassword(value);
          if (!result.isValid) {
            this.showError(input, result.message);
            return false;
          }
        }
        break;
        
      case 'name':
        if (value && !this.isValidName(value)) {
          this.showError(input, 'Name should contain only letters and spaces (2-50 characters)');
          return false;
        }
        break;
        
      case 'age':
        if (value && !this.isValidAge(value)) {
          this.showError(input, 'Please enter a valid age (1-120)');
          return false;
        }
        break;
    }
    
    if (value) {
      this.showSuccess(input);
    }
    return true;
  },

  /**
   * Validate entire form
   */
  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[data-validate], input[type="email"], input[required]');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  },

  /**
   * Attach real-time validation to form
   */
  attachLiveValidation(form) {
    const inputs = form.querySelectorAll('input[data-validate], input[type="email"], input[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          this.validateField(input);
        }
      });
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}
