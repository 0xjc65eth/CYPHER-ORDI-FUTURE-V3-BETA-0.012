import { logger } from '@/lib/enhanced-logger'

export interface UserAction {
  id: string
  type: 'click' | 'navigation' | 'form_submit' | 'wallet_connect' | 'trade' | 'error' | 'page_view' | 'custom'
  element?: string
  page: string
  timestamp: string
  userId?: string
  sessionId: string
  metadata?: Record<string, any>
  duration?: number
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: string
  lastActivity: string
  pageViews: number
  actions: number
  device: string
  browser: string
  referrer: string
}

class UserActionTracker {
  private actions: UserAction[] = []
  private session: UserSession | null = null
  private actionIdCounter = 0
  private isTracking = false
  private trackingStartTime = 0

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  /**
   * Initialize user action tracking
   */
  private init(): void {
    this.initSession()
    this.setupEventListeners()
    this.trackPageView()
    this.isTracking = true
    
    logger.info('User action tracking initialized', {
      sessionId: this.session?.sessionId
    })
  }

  /**
   * Initialize user session
   */
  private initSession(): void {
    const sessionId = this.getOrCreateSessionId()
    const userId = this.getUserId()
    
    this.session = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      actions: 0,
      device: this.getDeviceInfo(),
      browser: this.getBrowserInfo(),
      referrer: document.referrer || 'direct'
    }

    this.persistSession()
  }

  /**
   * Set up event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      this.handleClickEvent(event)
    }, { passive: true })

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.handleFormSubmit(event)
    }, { passive: true })

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackPageView()
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackAction({
          type: 'custom',
          element: 'page_hidden',
          metadata: { visibility: 'hidden' }
        })
      } else {
        this.trackAction({
          type: 'custom',
          element: 'page_visible',
          metadata: { visibility: 'visible' }
        })
      }
    })

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })

    // Update last activity periodically
    setInterval(() => {
      this.updateLastActivity()
    }, 30000) // Every 30 seconds
  }

  /**
   * Handle click events
   */
  private handleClickEvent(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (!target) return

    const element = this.getElementIdentifier(target)
    const metadata = this.getClickMetadata(event, target)

    this.trackAction({
      type: 'click',
      element,
      metadata
    })
  }

  /**
   * Handle form submissions
   */
  private handleFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement
    if (!form) return

    const formId = form.id || form.className || 'unknown_form'
    const metadata = {
      formId,
      action: form.action,
      method: form.method,
      fieldCount: form.elements.length
    }

    this.trackAction({
      type: 'form_submit',
      element: formId,
      metadata
    })
  }

  /**
   * Track user action
   */
  trackAction(action: Omit<UserAction, 'id' | 'page' | 'timestamp' | 'sessionId' | 'userId'>): void {
    if (!this.isTracking || !this.session) return

    const fullAction: UserAction = {
      id: this.generateActionId(),
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      sessionId: this.session.sessionId,
      userId: this.session.userId,
      ...action
    }

    this.actions.push(fullAction)
    this.session.actions++
    this.updateLastActivity()

    // Log action
    logger.info('User action tracked', {
      actionId: fullAction.id,
      type: fullAction.type,
      element: fullAction.element,
      page: fullAction.page
    })

    // Keep only recent actions (last 500)
    if (this.actions.length > 500) {
      this.actions = this.actions.slice(-500)
    }

    this.persistActions()
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    if (!this.session) return

    this.session.pageViews++
    this.trackAction({
      type: 'page_view',
      element: window.location.pathname,
      metadata: {
        title: document.title,
        url: window.location.href,
        referrer: document.referrer
      }
    })
  }

  /**
   * Track wallet connection
   */
  trackWalletConnection(walletType: string, success: boolean, error?: string): void {
    this.trackAction({
      type: 'wallet_connect',
      element: walletType,
      metadata: {
        success,
        error,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Track trade action
   */
  trackTrade(tradeData: {
    type: 'buy' | 'sell'
    asset: string
    amount: number
    price?: number
    success: boolean
    error?: string
  }): void {
    this.trackAction({
      type: 'trade',
      element: `${tradeData.type}_${tradeData.asset}`,
      metadata: {
        ...tradeData,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Track error occurrence
   */
  trackError(error: {
    message: string
    stack?: string
    component?: string
    level: 'error' | 'warning' | 'info'
  }): void {
    this.trackAction({
      type: 'error',
      element: error.component || 'unknown',
      metadata: {
        ...error,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Start timing an action
   */
  startTiming(actionType: string): string {
    const timingId = `timing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.trackingStartTime = performance.now()
    
    return timingId
  }

  /**
   * End timing an action
   */
  endTiming(timingId: string, actionType: string, element?: string, metadata?: Record<string, any>): void {
    const duration = performance.now() - this.trackingStartTime
    
    this.trackAction({
      type: actionType as any,
      element: element || actionType,
      duration,
      metadata: {
        ...metadata,
        timingId
      }
    })
  }

  /**
   * Get user actions
   */
  getActions(): UserAction[] {
    return [...this.actions]
  }

  /**
   * Get actions by type
   */
  getActionsByType(type: UserAction['type']): UserAction[] {
    return this.actions.filter(action => action.type === type)
  }

  /**
   * Get session information
   */
  getSession(): UserSession | null {
    return this.session ? { ...this.session } : null
  }

  /**
   * Get user behavior analytics
   */
  getAnalytics(): {
    totalActions: number
    actionTypes: Record<string, number>
    averageSessionTime: number
    mostClickedElements: Array<{ element: string; count: number }>
    pageViews: Record<string, number>
    errorRate: number
  } {
    const analytics = {
      totalActions: this.actions.length,
      actionTypes: {} as Record<string, number>,
      averageSessionTime: 0,
      mostClickedElements: [] as Array<{ element: string; count: number }>,
      pageViews: {} as Record<string, number>,
      errorRate: 0
    }

    // Count action types
    this.actions.forEach(action => {
      analytics.actionTypes[action.type] = (analytics.actionTypes[action.type] || 0) + 1
    })

    // Calculate session time
    if (this.session) {
      const sessionStart = new Date(this.session.startTime).getTime()
      const lastActivity = new Date(this.session.lastActivity).getTime()
      analytics.averageSessionTime = lastActivity - sessionStart
    }

    // Most clicked elements
    const elementCounts = {} as Record<string, number>
    this.actions
      .filter(action => action.type === 'click' && action.element)
      .forEach(action => {
        elementCounts[action.element!] = (elementCounts[action.element!] || 0) + 1
      })

    analytics.mostClickedElements = Object.entries(elementCounts)
      .map(([element, count]) => ({ element, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Page views
    this.actions
      .filter(action => action.type === 'page_view')
      .forEach(action => {
        analytics.pageViews[action.page] = (analytics.pageViews[action.page] || 0) + 1
      })

    // Error rate
    const errorCount = analytics.actionTypes.error || 0
    analytics.errorRate = this.actions.length > 0 ? errorCount / this.actions.length : 0

    return analytics
  }

  /**
   * Utility methods
   */
  private generateActionId(): string {
    return `action_${Date.now()}_${++this.actionIdCounter}`
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('userSessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('userSessionId', sessionId)
    }
    return sessionId
  }

  private getUserId(): string | undefined {
    try {
      return localStorage.getItem('userId') || undefined
    } catch {
      return undefined
    }
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile'
    }
    if (/Tablet|iPad/.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getElementIdentifier(element: HTMLElement): string {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ').join('.')}`
    if (element.tagName) return element.tagName.toLowerCase()
    return 'unknown'
  }

  private getClickMetadata(event: MouseEvent, target: HTMLElement) {
    return {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      innerText: target.innerText?.substring(0, 100),
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    }
  }

  private updateLastActivity(): void {
    if (this.session) {
      this.session.lastActivity = new Date().toISOString()
      this.persistSession()
    }
  }

  private persistSession(): void {
    if (this.session) {
      try {
        sessionStorage.setItem('userSession', JSON.stringify(this.session))
      } catch (error) {
        logger.warn('Failed to persist session', { error })
      }
    }
  }

  private persistActions(): void {
    try {
      // Only persist recent actions to avoid storage issues
      const recentActions = this.actions.slice(-100)
      localStorage.setItem('userActions', JSON.stringify(recentActions))
    } catch (error) {
      logger.warn('Failed to persist actions', { error })
    }
  }

  private endSession(): void {
    if (this.session) {
      this.trackAction({
        type: 'custom',
        element: 'session_end',
        metadata: {
          sessionDuration: Date.now() - new Date(this.session.startTime).getTime(),
          totalActions: this.session.actions,
          totalPageViews: this.session.pageViews
        }
      })

      logger.info('User session ended', {
        sessionId: this.session.sessionId,
        duration: Date.now() - new Date(this.session.startTime).getTime(),
        actions: this.session.actions,
        pageViews: this.session.pageViews
      })
    }
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    if (this.session) {
      this.session.userId = userId
      this.persistSession()
    }
    
    try {
      localStorage.setItem('userId', userId)
    } catch (error) {
      logger.warn('Failed to persist user ID', { error })
    }
  }

  /**
   * Clear tracking data
   */
  clearData(): void {
    this.actions = []
    this.session = null
    
    try {
      sessionStorage.removeItem('userSession')
      sessionStorage.removeItem('userSessionId')
      localStorage.removeItem('userActions')
    } catch (error) {
      logger.warn('Failed to clear tracking data', { error })
    }
  }

  /**
   * Stop tracking
   */
  stopTracking(): void {
    this.isTracking = false
    this.endSession()
  }
}

// Export singleton instance
export const userActionTracker = new UserActionTracker()