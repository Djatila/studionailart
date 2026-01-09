/**
 * Analytics and Conversion Tracking
 * Studio Nail Art Landing Page
 */

// ===== TYPES =====
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface ConversionEvent {
  type: 'cta_click' | 'form_submit' | 'scroll_depth' | 'time_on_page' | 'feature_interaction';
  element?: string;
  value?: any;
  timestamp: number;
  sessionId: string;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  conversions: ConversionEvent[];
  device: string;
  referrer: string;
}

// ===== SESSION MANAGEMENT =====
class SessionManager {
  private session: UserSession;
  private storageKey = 'studio_nail_art_session';
  
  constructor() {
    this.session = this.loadOrCreateSession();
    this.startActivityTracking();
  }
  
  private loadOrCreateSession(): UserSession {
    const stored = localStorage.getItem(this.storageKey);
    
    if (stored) {
      const session = JSON.parse(stored);
      // Check if session is still valid (less than 30 minutes old)
      if (Date.now() - session.lastActivity < 30 * 60 * 1000) {
        session.lastActivity = Date.now();
        session.pageViews++;
        return session;
      }
    }
    
    // Create new session
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: [],
      conversions: [],
      device: this.detectDevice(),
      referrer: document.referrer || 'direct'
    };
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private detectDevice(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  private startActivityTracking(): void {
    // Update last activity on user interaction
    ['click', 'scroll', 'keypress', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.session.lastActivity = Date.now();
        this.saveSession();
      }, { passive: true });
    });
    
    // Save session periodically
    setInterval(() => {
      this.saveSession();
    }, 10000); // Every 10 seconds
    
    // Save session before page unload
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });
  }
  
  private saveSession(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.session));
  }
  
  public getSession(): UserSession {
    return this.session;
  }
  
  public addEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.session.sessionId
    };
    
    this.session.events.push(fullEvent);
    this.saveSession();
  }
  
  public addConversion(conversion: Omit<ConversionEvent, 'timestamp' | 'sessionId'>): void {
    const fullConversion: ConversionEvent = {
      ...conversion,
      timestamp: Date.now(),
      sessionId: this.session.sessionId
    };
    
    this.session.conversions.push(fullConversion);
    this.saveSession();
  }
}

// ===== CONVERSION TRACKING =====
class ConversionTracker {
  private sessionManager: SessionManager;
  
  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.initializeTracking();
  }
  
  private initializeTracking(): void {
    this.trackCTAClicks();
    this.trackScrollDepth();
    this.trackTimeOnPage();
    this.trackFormInteractions();
    this.trackFeatureInteractions();
  }
  
  // Track CTA button clicks
  private trackCTAClicks(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, [role="button"], a[href]');
      
      if (button) {
        const text = button.textContent?.trim() || '';
        const href = button.getAttribute('href');
        
        this.sessionManager.addConversion({
          type: 'cta_click',
          element: text,
          value: { href }
        });
        
        this.sessionManager.addEvent({
          category: 'CTA',
          action: 'click',
          label: text
        });
        
        // Send to external analytics if available
        if (window.gtag) {
          window.gtag('event', 'cta_click', {
            event_category: 'Conversion',
            event_label: text,
            value: 1
          });
        }
      }
    });
  }
  
  // Track scroll depth
  private trackScrollDepth(): void {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();
    
    const checkScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          
          this.sessionManager.addConversion({
            type: 'scroll_depth',
            value: milestone
          });
          
          this.sessionManager.addEvent({
            category: 'Engagement',
            action: 'scroll_depth',
            label: `${milestone}%`,
            value: milestone
          });
          
          if (window.gtag) {
            window.gtag('event', 'scroll_depth', {
              event_category: 'Engagement',
              event_label: `${milestone}%`,
              value: milestone
            });
          }
        }
      });
    };
    
    window.addEventListener('scroll', () => {
      requestAnimationFrame(checkScroll);
    }, { passive: true });
  }
  
  // Track time on page
  private trackTimeOnPage(): void {
    const intervals = [30, 60, 120, 300]; // seconds
    const reached = new Set<number>();
    
    intervals.forEach(interval => {
      setTimeout(() => {
        if (!reached.has(interval)) {
          reached.add(interval);
          
          this.sessionManager.addConversion({
            type: 'time_on_page',
            value: interval
          });
          
          this.sessionManager.addEvent({
            category: 'Engagement',
            action: 'time_on_page',
            label: `${interval}s`,
            value: interval
          });
          
          if (window.gtag) {
            window.gtag('event', 'time_on_page', {
              event_category: 'Engagement',
              event_label: `${interval}s`,
              value: interval
            });
          }
        }
      }, interval * 1000);
    });
  }
  
  // Track form interactions
  private trackFormInteractions(): void {
    document.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const fieldName = target.getAttribute('name') || target.getAttribute('id') || 'unknown';
        
        this.sessionManager.addEvent({
          category: 'Form',
          action: 'field_focus',
          label: fieldName
        });
      }
    }, true);
    
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.getAttribute('id') || 'unknown';
      
      this.sessionManager.addConversion({
        type: 'form_submit',
        element: formName
      });
      
      this.sessionManager.addEvent({
        category: 'Form',
        action: 'submit',
        label: formName
      });
      
      if (window.gtag) {
        window.gtag('event', 'form_submit', {
          event_category: 'Conversion',
          event_label: formName,
          value: 10
        });
      }
    });
  }
  
  // Track feature tab interactions
  private trackFeatureInteractions(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const featureTab = target.closest('[data-feature-tab]');
      
      if (featureTab) {
        const featureName = featureTab.getAttribute('data-feature-tab') || 'unknown';
        
        this.sessionManager.addConversion({
          type: 'feature_interaction',
          element: featureName
        });
        
        this.sessionManager.addEvent({
          category: 'Feature',
          action: 'tab_click',
          label: featureName
        });
        
        if (window.gtag) {
          window.gtag('event', 'feature_interaction', {
            event_category: 'Engagement',
            event_label: featureName,
            value: 1
          });
        }
      }
    });
  }
}

// ===== HEATMAP TRACKING =====
class HeatmapTracker {
  private clicks: Array<{ x: number; y: number; timestamp: number }> = [];
  private maxClicks = 1000;
  
  constructor() {
    this.initializeTracking();
  }
  
  private initializeTracking(): void {
    document.addEventListener('click', (e) => {
      this.recordClick(e.clientX, e.clientY);
    });
  }
  
  private recordClick(x: number, y: number): void {
    this.clicks.push({
      x,
      y,
      timestamp: Date.now()
    });
    
    // Keep only recent clicks
    if (this.clicks.length > this.maxClicks) {
      this.clicks.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('heatmap_clicks', JSON.stringify(this.clicks));
  }
  
  public getClicks(): Array<{ x: number; y: number; timestamp: number }> {
    return this.clicks;
  }
  
  public visualizeHeatmap(): void {
    // Create heatmap overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    this.clicks.forEach(click => {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: absolute;
        left: ${click.x}px;
        top: ${click.y}px;
        width: 10px;
        height: 10px;
        background: rgba(255, 0, 127, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%);
      `;
      overlay.appendChild(dot);
    });
    
    document.body.appendChild(overlay);
    
    // Remove after 5 seconds
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 5000);
  }
}

// ===== FUNNEL ANALYSIS =====
class FunnelAnalyzer {
  private funnelSteps = [
    'page_load',
    'scroll_25',
    'cta_view',
    'cta_click',
    'form_start',
    'form_submit'
  ];
  
  private completedSteps = new Set<string>();
  
  constructor(private sessionManager: SessionManager) {
    this.trackFunnelProgress();
  }
  
  private trackFunnelProgress(): void {
    // Page load
    this.completeStep('page_load');
    
    // Scroll milestones
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      if (scrollPercent >= 25) this.completeStep('scroll_25');
    }, { passive: true });
    
    // CTA view (intersection observer)
    const ctaButtons = document.querySelectorAll('button, [role="button"]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.completeStep('cta_view');
        }
      });
    });
    
    ctaButtons.forEach(button => observer.observe(button));
    
    // CTA click
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, [role="button"]')) {
        this.completeStep('cta_click');
      }
    });
    
    // Form interactions
    document.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.completeStep('form_start');
      }
    }, true);
    
    document.addEventListener('submit', () => {
      this.completeStep('form_submit');
    });
  }
  
  private completeStep(step: string): void {
    if (!this.completedSteps.has(step)) {
      this.completedSteps.add(step);
      
      this.sessionManager.addEvent({
        category: 'Funnel',
        action: 'step_complete',
        label: step
      });
      
      if (window.gtag) {
        window.gtag('event', 'funnel_step', {
          event_category: 'Funnel',
          event_label: step,
          value: this.funnelSteps.indexOf(step) + 1
        });
      }
    }
  }
  
  public getFunnelProgress(): { step: string; completed: boolean }[] {
    return this.funnelSteps.map(step => ({
      step,
      completed: this.completedSteps.has(step)
    }));
  }
}

// ===== INITIALIZATION =====
let sessionManager: SessionManager;
let conversionTracker: ConversionTracker;
let heatmapTracker: HeatmapTracker;
let funnelAnalyzer: FunnelAnalyzer;

export const initializeAnalytics = (): void => {
  sessionManager = new SessionManager();
  conversionTracker = new ConversionTracker(sessionManager);
  heatmapTracker = new HeatmapTracker();
  funnelAnalyzer = new FunnelAnalyzer(sessionManager);
  
  console.log('Analytics initialized', sessionManager.getSession());
};

export const getSession = (): UserSession | null => {
  return sessionManager ? sessionManager.getSession() : null;
};

export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>): void => {
  if (sessionManager) {
    sessionManager.addEvent(event);
  }
};

export const trackConversion = (conversion: Omit<ConversionEvent, 'timestamp' | 'sessionId'>): void => {
  if (sessionManager) {
    sessionManager.addConversion(conversion);
  }
};

export const visualizeHeatmap = (): void => {
  if (heatmapTracker) {
    heatmapTracker.visualizeHeatmap();
  }
};

export const getFunnelProgress = (): { step: string; completed: boolean }[] | null => {
  return funnelAnalyzer ? funnelAnalyzer.getFunnelProgress() : null;
};

// ===== TYPE DECLARATIONS =====
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default {
  initializeAnalytics,
  getSession,
  trackEvent,
  trackConversion,
  visualizeHeatmap,
  getFunnelProgress
};