/**
 * localStorage Utility Module
 * Provides centralized localStorage operations for the Transport Management System
 */

const LocalStorageManager = {
  // Keys for different data types
  KEYS: {
    FILTER_PREFERENCES: 'transport_filter_preferences',
    BOOKING_FORM_DRAFT: 'transport_booking_form_draft',
    RECENTLY_VIEWED_ROUTES: 'transport_recently_viewed_routes',
    USER_PREFERENCES: 'transport_user_preferences',
    DASHBOARD_PREFERENCES: 'transport_dashboard_preferences'
  },

  /**
   * Generic get method
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Generic set method
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Clearing old data...');
        this.clearOldData();
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to save after clearing old data:', retryError);
          return false;
        }
      }
      return false;
    }
  },

  /**
   * Generic remove method
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage data
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Clear old data when quota is exceeded
   */
  clearOldData() {
    // Remove draft data first (least important)
    this.remove(this.KEYS.BOOKING_FORM_DRAFT);
    
    // Trim recently viewed routes to last 5
    const recentRoutes = this.get(this.KEYS.RECENTLY_VIEWED_ROUTES, []);
    if (recentRoutes.length > 5) {
      this.set(this.KEYS.RECENTLY_VIEWED_ROUTES, recentRoutes.slice(-5));
    }
  },

  // ==================== FILTER PREFERENCES ====================
  
  /**
   * Save filter preferences
   */
  saveFilterPreferences(filters) {
    return this.set(this.KEYS.FILTER_PREFERENCES, {
      ...filters,
      savedAt: new Date().toISOString()
    });
  },

  /**
   * Get saved filter preferences
   */
  getFilterPreferences() {
    return this.get(this.KEYS.FILTER_PREFERENCES, {});
  },

  /**
   * Clear filter preferences
   */
  clearFilterPreferences() {
    return this.remove(this.KEYS.FILTER_PREFERENCES);
  },

  // ==================== BOOKING FORM AUTO-SAVE ====================
  
  /**
   * Save booking form draft
   */
  saveBookingFormDraft(formData) {
    return this.set(this.KEYS.BOOKING_FORM_DRAFT, {
      ...formData,
      savedAt: new Date().toISOString()
    });
  },

  /**
   * Get booking form draft
   */
  getBookingFormDraft() {
    return this.get(this.KEYS.BOOKING_FORM_DRAFT, null);
  },

  /**
   * Clear booking form draft (after successful submission)
   */
  clearBookingFormDraft() {
    return this.remove(this.KEYS.BOOKING_FORM_DRAFT);
  },

  // ==================== RECENTLY VIEWED ROUTES ====================
  
  /**
   * Add a route to recently viewed
   */
  addRecentlyViewedRoute(routeData) {
    const recentRoutes = this.get(this.KEYS.RECENTLY_VIEWED_ROUTES, []);
    
    // Remove if already exists (to avoid duplicates)
    const filtered = recentRoutes.filter(r => r.routeNumber !== routeData.routeNumber);
    
    // Add to beginning
    filtered.unshift({
      ...routeData,
      viewedAt: new Date().toISOString()
    });
    
    // Keep only last 10 routes
    const trimmed = filtered.slice(0, 10);
    
    return this.set(this.KEYS.RECENTLY_VIEWED_ROUTES, trimmed);
  },

  /**
   * Get recently viewed routes
   */
  getRecentlyViewedRoutes(limit = 10) {
    const routes = this.get(this.KEYS.RECENTLY_VIEWED_ROUTES, []);
    return routes.slice(0, limit);
  },

  /**
   * Clear recently viewed routes
   */
  clearRecentlyViewedRoutes() {
    return this.remove(this.KEYS.RECENTLY_VIEWED_ROUTES);
  },

  // ==================== USER PREFERENCES ====================
  
  /**
   * Save user preferences
   */
  saveUserPreferences(preferences) {
    const current = this.getUserPreferences();
    return this.set(this.KEYS.USER_PREFERENCES, {
      ...current,
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Get user preferences
   */
  getUserPreferences() {
    return this.get(this.KEYS.USER_PREFERENCES, {
      theme: 'light',
      defaultDate: 'today',
      language: 'en',
      notifications: true
    });
  },

  /**
   * Get a specific preference
   */
  getPreference(key, defaultValue = null) {
    const preferences = this.getUserPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  },

  /**
   * Set a specific preference
   */
  setPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    return this.saveUserPreferences(preferences);
  },

  // ==================== DASHBOARD PREFERENCES ====================
  
  /**
   * Save dashboard preferences
   */
  saveDashboardPreferences(preferences) {
    const current = this.getDashboardPreferences();
    return this.set(this.KEYS.DASHBOARD_PREFERENCES, {
      ...current,
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Get dashboard preferences
   */
  getDashboardPreferences() {
    return this.get(this.KEYS.DASHBOARD_PREFERENCES, {
      viewMode: 'grid',
      itemsPerPage: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalStorageManager;
}



