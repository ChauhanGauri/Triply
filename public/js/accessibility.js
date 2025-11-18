/**
 * Accessibility Enhancements
 * Improves keyboard navigation and screen reader support
 */

const A11y = {
  /**
   * Initialize accessibility features
   */
  init() {
    this.setupKeyboardNavigation();
    this.setupSkipLinks();
    this.enhanceFocusIndicators();
    this.setupAriaLiveRegions();
  },

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.show');
        if (modal) {
          const closeBtn = modal.querySelector('[data-bs-dismiss="modal"]');
          if (closeBtn) closeBtn.click();
        }
      }
    });

    // Arrow keys for navigation in lists
    const navigableLists = document.querySelectorAll('[role="menu"], [role="listbox"]');
    navigableLists.forEach(list => {
      const items = list.querySelectorAll('[role="menuitem"], [role="option"]');
      
      items.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          let nextIndex;
          
          switch(e.key) {
            case 'ArrowDown':
              e.preventDefault();
              nextIndex = (index + 1) % items.length;
              items[nextIndex].focus();
              break;
              
            case 'ArrowUp':
              e.preventDefault();
              nextIndex = (index - 1 + items.length) % items.length;
              items[nextIndex].focus();
              break;
              
            case 'Home':
              e.preventDefault();
              items[0].focus();
              break;
              
            case 'End':
              e.preventDefault();
              items[items.length - 1].focus();
              break;
          }
        });
      });
    });
  },

  /**
   * Setup skip links for keyboard users
   */
  setupSkipLinks() {
    if (!document.querySelector('#skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-content';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'skip-link';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 10001;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
      
      // Ensure main content has id
      const mainContent = document.querySelector('main') || 
                         document.querySelector('[role="main"]') ||
                         document.querySelector('.container').parentElement;
      if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
      }
    }
  },

  /**
   * Enhance focus indicators
   */
  enhanceFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 2px solid #EC4899;
        outline-offset: 2px;
      }
      
      *:focus:not(:focus-visible) {
        outline: none;
      }
      
      *:focus-visible {
        outline: 2px solid #EC4899;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Setup ARIA live regions for dynamic content
   */
  setupAriaLiveRegions() {
    if (!document.querySelector('#aria-live-polite')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-polite';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }
    
    if (!document.querySelector('#aria-live-assertive')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'aria-live-assertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'visually-hidden';
      document.body.appendChild(assertiveRegion);
    }
  },

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  },

  /**
   * Add ARIA labels to unlabeled buttons
   */
  labelButtons() {
    const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    
    unlabeledButtons.forEach(button => {
      const icon = button.querySelector('i');
      if (icon && !button.textContent.trim()) {
        // Try to infer label from icon class
        const iconClass = icon.className;
        let label = 'Button';
        
        if (iconClass.includes('edit')) label = 'Edit';
        else if (iconClass.includes('delete') || iconClass.includes('trash')) label = 'Delete';
        else if (iconClass.includes('view') || iconClass.includes('eye')) label = 'View';
        else if (iconClass.includes('add') || iconClass.includes('plus')) label = 'Add';
        else if (iconClass.includes('close') || iconClass.includes('x')) label = 'Close';
        
        button.setAttribute('aria-label', label);
      }
    });
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => A11y.init());
} else {
  A11y.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = A11y;
}
