/**
 * Loading Spinner & States
 * Provides better UX during async operations
 */

const LoadingState = {
  /**
   * Show full page loader
   */
  showPageLoader(message = 'Loading...') {
    let loader = document.getElementById('page-loader');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.innerHTML = `
        <div class="loader-backdrop">
          <div class="loader-content">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-white" id="loader-message">${message}</p>
          </div>
        </div>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        #page-loader .loader-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease-out;
        }
        
        #page-loader .loader-content {
          text-align: center;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      loader.appendChild(style);
      document.body.appendChild(loader);
    } else {
      loader.style.display = 'block';
      document.getElementById('loader-message').textContent = message;
    }
  },

  /**
   * Hide full page loader
   */
  hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  },

  /**
   * Show button loading state
   */
  showButtonLoading(button, message = 'Processing...') {
    if (!button) return;
    
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ${message}
    `;
  },

  /**
   * Hide button loading state
   */
  hideButtonLoading(button) {
    if (!button) return;
    
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  },

  /**
   * Show skeleton loader for content
   */
  showSkeleton(container, lines = 3) {
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < lines; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-line mb-2';
      skeleton.style.cssText = `
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        width: ${Math.random() * 30 + 70}%;
      `;
      container.appendChild(skeleton);
    }
    
    // Add animation if not already present
    if (!document.querySelector('#skeleton-animation')) {
      const style = document.createElement('style');
      style.id = 'skeleton-animation';
      style.textContent = `
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingState;
}
