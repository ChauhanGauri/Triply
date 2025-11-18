/**
 * Global Error Handler
 * Catches and displays errors gracefully
 */

const ErrorHandler = {
  /**
   * Initialize error handling
   */
  init() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      this.showError('An unexpected error occurred. Please refresh the page.');
      event.preventDefault();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('An error occurred while processing your request.');
      event.preventDefault();
    });

    // Handle offline status
    window.addEventListener('offline', () => {
      this.showError('You are offline. Please check your internet connection.', 'warning');
    });

    window.addEventListener('online', () => {
      if (typeof Toast !== 'undefined') {
        Toast.success('Connection restored');
      }
    });
  },

  /**
   * Show error message
   */
  showError(message, type = 'error') {
    if (typeof Toast !== 'undefined') {
      Toast[type](message);
    } else {
      alert(message);
    }
  },

  /**
   * Handle API errors
   */
  handleApiError(error, customMessage = null) {
    console.error('API Error:', error);

    let message = customMessage || 'An error occurred. Please try again.';

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      
      switch(status) {
        case 400:
          message = error.response.data?.message || 'Invalid request';
          break;
        case 401:
          message = 'Please log in to continue';
          setTimeout(() => {
            window.location.href = '/auth/user/login';
          }, 2000);
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = error.response.data?.message || message;
      }
    } else if (error.request) {
      // Request made but no response
      message = 'Unable to connect to server. Please check your connection.';
    }

    this.showError(message);
    return message;
  },

  /**
   * Handle form submission errors
   */
  handleFormError(form, errors) {
    // Clear previous errors
    form.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    form.querySelectorAll('.validation-error').forEach(el => {
      el.remove();
    });

    // Show new errors
    if (typeof errors === 'string') {
      this.showError(errors);
    } else if (typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && typeof Validator !== 'undefined') {
          Validator.showError(input, errors[field]);
        }
      });
    }
  },

  /**
   * Retry failed operation
   */
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
  ErrorHandler.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
