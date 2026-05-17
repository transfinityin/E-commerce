// Analytics Service for tracking user behavior
// Supports Google Analytics, custom events, and performance monitoring

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.pageViews = []
    this.events = []
    this.initialized = false
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize analytics - call this once on app load
  init() {
    if (this.initialized) return
    
    // Load Google Analytics if GA_ID is set
    if (import.meta.env.VITE_GA_ID) {
      this.initGoogleAnalytics(import.meta.env.VITE_GA_ID)
    }

    // Track page performance
    this.trackPerformance()
    
    this.initialized = true
    console.log('Analytics initialized')
  }

  initGoogleAnalytics(gaId) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', gaId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    })
  }

  // Track page view
  trackPageView(path, title) {
    const pageView = {
      path,
      title,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    }
    
    this.pageViews.push(pageView)

    if (window.gtag) {
      window.gtag('pageview', {
        page_path: path,
        page_title: title,
      })
    }

    console.log('Page view tracked:', path)
  }

  // Track custom events
  trackEvent(category, action, label = '', value = null) {
    const event = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    }

    this.events.push(event)

    if (window.gtag) {
      window.gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value,
      })
    }

    console.log('Event tracked:', { category, action, label })
  }

  // Track e-commerce events
  trackEcommerce(action, data) {
    if (window.gtag) {
      window.gtag('event', action, data)
    }

    const event = {
      type: 'ecommerce',
      action,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    }

    this.events.push(event)
    console.log('Ecommerce event tracked:', action)
  }

  // Track product view
  trackProductView(productId, productName, price, category) {
    this.trackEcommerce('view_item', {
      items: [{
        item_id: productId,
        item_name: productName,
        price,
        item_category: category,
      }]
    })
  }

  // Track add to cart
  trackAddToCart(productId, productName, price, quantity = 1) {
    this.trackEcommerce('add_to_cart', {
      items: [{
        item_id: productId,
        item_name: productName,
        price,
        quantity,
      }]
    })
  }

  // Track purchase
  trackPurchase(orderId, items, total, currency = 'INR') {
    this.trackEcommerce('purchase', {
      transaction_id: orderId,
      value: total,
      currency,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_category: item.category,
      }))
    })
  }

  // Track performance metrics
  trackPerformance() {
    if (!window.performance) return

    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      const connectTime = perfData.responseEnd - perfData.requestStart
      const renderTime = perfData.domComplete - perfData.domLoading

      const metrics = {
        pageLoadTime,
        connectTime,
        renderTime,
        dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
        ttfb: perfData.responseStart - perfData.navigationStart,
      }

      if (window.gtag) {
        window.gtag('event', 'page_performance', metrics)
      }

      console.log('Performance metrics:', metrics)
    })
  }

  // Track user interactions
  trackUserInteraction(type, element, details = {}) {
    this.trackEvent('user_interaction', type, element, JSON.stringify(details))
  }

  // Track search
  trackSearch(searchTerm, results = 0) {
    this.trackEvent('search', 'performed', searchTerm, results)
  }

  // Track filter application
  trackFilter(filterType, filterValue) {
    this.trackEvent('filter', 'applied', `${filterType}:${filterValue}`)
  }

  // Track form submission
  trackFormSubmit(formName, success = true) {
    this.trackEvent('form', formName, success ? 'success' : 'failure')
  }

  // Track error
  trackError(errorMessage, severity = 'error') {
    this.trackEvent('error', severity, errorMessage)
  }

  // Get session analytics
  getSessionAnalytics() {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      events: this.events,
      totalPageViews: this.pageViews.length,
      totalEvents: this.events.length,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('-')[0]),
    }
  }

  // Send analytics to server (optional)
  sendAnalytics(endpoint = '/api/analytics') {
    const analytics = this.getSessionAnalytics()
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics),
    }).catch(err => console.log('Failed to send analytics:', err))
  }
}

// Create singleton instance
export const analytics = new AnalyticsService()

export default AnalyticsService
