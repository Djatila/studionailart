/**
 * Advanced Performance Monitoring
 * Studio Nail Art Landing Page
 */

// ===== TYPES =====
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Additional Metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;
  
  // Custom Metrics
  timeToInteractive?: number;
  firstMeaningfulPaint?: number;
  
  // Resource Metrics
  resourceCount?: number;
  totalResourceSize?: number;
  
  // User Experience
  scrollDepth?: number;
  timeOnPage?: number;
  
  timestamp: number;
  sessionId: string;
  userAgent: string;
  connection?: string;
  deviceMemory?: number;
}

interface ResourceTiming {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  totalSize: number;
  resourceCount: number;
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private budget: PerformanceBudget;
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number;
  
  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory()
    };
    
    this.budget = {
      lcp: 2500,    // 2.5 seconds
      fid: 100,     // 100 milliseconds
      cls: 0.1,     // 0.1 score
      fcp: 1800,    // 1.8 seconds
      ttfb: 800,    // 800 milliseconds
      totalSize: 1500000, // 1.5MB
      resourceCount: 50
    };
    
    this.initializeMonitoring();
  }
  
  private getSessionId(): string {
    return localStorage.getItem('studio_nail_art_session') || 'unknown';
  }
  
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }
  
  private getDeviceMemory(): number {
    return (navigator as any).deviceMemory || 0;
  }
  
  private initializeMonitoring(): void {
    this.monitorCoreWebVitals();
    this.monitorNavigationTiming();
    this.monitorResourceTiming();
    this.monitorCustomMetrics();
    this.monitorUserExperience();
    
    // Report metrics when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
    
    // Report metrics after 30 seconds
    setTimeout(() => {
      this.reportMetrics();
    }, 30000);
  }
  
  // ===== CORE WEB VITALS =====
  private monitorCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.metrics.lcp = Math.round(lastEntry.startTime);
          this.checkBudget('lcp', this.metrics.lcp);
          
          console.log(`LCP: ${this.metrics.lcp}ms`);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
            this.checkBudget('fid', this.metrics.fid);
            
            console.log(`FID: ${this.metrics.fid}ms`);
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.metrics.cls = Math.round(clsValue * 1000) / 1000;
          this.checkBudget('cls', this.metrics.cls);
          
          console.log(`CLS: ${this.metrics.cls}`);
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS monitoring not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = Math.round(entry.startTime);
              this.checkBudget('fcp', this.metrics.fcp);
              
              console.log(`FCP: ${this.metrics.fcp}ms`);
            }
          });
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (e) {
        console.warn('FCP monitoring not supported');
      }
    }
  }
  
  // ===== NAVIGATION TIMING =====
  private monitorNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.metrics.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          this.metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.metrics.loadComplete = Math.round(navigation.loadEventEnd - navigation.fetchStart);
          
          this.checkBudget('ttfb', this.metrics.ttfb);
          
          console.log(`TTFB: ${this.metrics.ttfb}ms`);
          console.log(`DOM Content Loaded: ${this.metrics.domContentLoaded}ms`);
          console.log(`Load Complete: ${this.metrics.loadComplete}ms`);
        }
      }, 0);
    });
  }
  
  // ===== RESOURCE TIMING =====
  private monitorResourceTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        let totalSize = 0;
        const resourceDetails: ResourceTiming[] = [];
        
        resources.forEach(resource => {
          const size = (resource as any).transferSize || 0;
          totalSize += size;
          
          resourceDetails.push({
            name: resource.name,
            type: this.getResourceType(resource.name),
            size,
            duration: Math.round(resource.duration),
            startTime: Math.round(resource.startTime)
          });
        });
        
        this.metrics.resourceCount = resources.length;
        this.metrics.totalResourceSize = totalSize;
        
        this.checkBudget('totalSize', totalSize);
        this.checkBudget('resourceCount', resources.length);
        
        console.log(`Resources: ${resources.length}, Total Size: ${(totalSize / 1024).toFixed(2)}KB`);
        
        // Log slow resources
        resourceDetails
          .filter(r => r.duration > 1000)
          .forEach(r => {
            console.warn(`Slow resource: ${r.name} (${r.duration}ms)`);
          });
      }, 1000);
    });
  }
  
  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'js';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }
  
  // ===== CUSTOM METRICS =====
  private monitorCustomMetrics(): void {
    // Time to Interactive (TTI) approximation
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.metrics.timeToInteractive = Math.round(performance.now() - this.startTime);
        console.log(`TTI (approx): ${this.metrics.timeToInteractive}ms`);
      }, 100);
    });
    
    // First Meaningful Paint approximation (when hero content is visible)
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.metrics.firstMeaningfulPaint) {
          this.metrics.firstMeaningfulPaint = Math.round(performance.now());
          console.log(`FMP (approx): ${this.metrics.firstMeaningfulPaint}ms`);
          heroObserver.disconnect();
        }
      });
    });
    
    // Observe hero section
    const heroSection = document.querySelector('section');
    if (heroSection) {
      heroObserver.observe(heroSection);
    }
  }
  
  // ===== USER EXPERIENCE METRICS =====
  private monitorUserExperience(): void {
    // Scroll depth
    let maxScrollDepth = 0;
    const updateScrollDepth = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
      this.metrics.scrollDepth = Math.round(maxScrollDepth);
    };
    
    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    
    // Time on page
    const updateTimeOnPage = () => {
      this.metrics.timeOnPage = Math.round(performance.now() - this.startTime);
    };
    
    setInterval(updateTimeOnPage, 5000);
    window.addEventListener('beforeunload', updateTimeOnPage);
  }
  
  // ===== BUDGET CHECKING =====
  private checkBudget(metric: keyof PerformanceBudget, value: number): void {
    const budget = this.budget[metric];
    
    if (value > budget) {
      console.warn(`Performance budget exceeded for ${metric}: ${value} > ${budget}`);
      
      // Send alert to monitoring service
      this.sendAlert(metric, value, budget);
    }
  }
  
  private sendAlert(metric: string, value: number, budget: number): void {
    // In a real application, this would send to a monitoring service
    console.warn(`🚨 Performance Alert: ${metric} = ${value} (budget: ${budget})`);
    
    // Could send to external service
    if (window.gtag) {
      window.gtag('event', 'performance_budget_exceeded', {
        event_category: 'Performance',
        event_label: metric,
        value: Math.round(value)
      });
    }
  }
  
  // ===== REPORTING =====
  public reportMetrics(): void {
    console.log('Performance Metrics:', this.metrics);
    
    // Save to localStorage for debugging
    localStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
    
    // Send to analytics
    if (window.gtag) {
      Object.entries(this.metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          window.gtag!('event', 'performance_metric', {
            event_category: 'Performance',
            event_label: key,
            value: Math.round(value)
          });
        }
      });
    }
    
    // In a real application, send to monitoring service
    // this.sendToMonitoringService(this.metrics);
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public getBudgetStatus(): { [key: string]: { value: number; budget: number; status: 'pass' | 'fail' } } {
    const status: any = {};
    
    Object.entries(this.budget).forEach(([key, budget]) => {
      const value = this.metrics[key as keyof PerformanceMetrics] as number;
      if (value !== undefined) {
        status[key] = {
          value,
          budget,
          status: value <= budget ? 'pass' : 'fail'
        };
      }
    });
    
    return status;
  }
  
  // ===== CLEANUP =====
  public destroy(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// ===== REAL USER MONITORING =====
class RealUserMonitoring {
  private metrics: Array<{ timestamp: number; data: any }> = [];
  private maxMetrics = 100;
  
  constructor() {
    this.initializeRUM();
  }
  
  private initializeRUM(): void {
    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordMetric('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('unhandled_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('long_task', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }
  
  private recordMetric(type: string, data: any): void {
    this.metrics.push({
      timestamp: Date.now(),
      data: { type, ...data }
    });
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    // Log critical issues
    if (type === 'javascript_error' || type === 'long_task') {
      console.warn(`RUM Alert: ${type}`, data);
    }
  }
  
  public getMetrics(): Array<{ timestamp: number; data: any }> {
    return [...this.metrics];
  }
}

// ===== INITIALIZATION =====
let performanceMonitor: PerformanceMonitor;
let realUserMonitoring: RealUserMonitoring;

export const initializePerformanceMonitoring = (): void => {
  performanceMonitor = new PerformanceMonitor();
  realUserMonitoring = new RealUserMonitoring();
  
  console.log('Performance monitoring initialized');
};

export const getPerformanceMetrics = (): PerformanceMetrics | null => {
  return performanceMonitor ? performanceMonitor.getMetrics() : null;
};

export const getBudgetStatus = () => {
  return performanceMonitor ? performanceMonitor.getBudgetStatus() : {};
};

export const getRUMMetrics = () => {
  return realUserMonitoring ? realUserMonitoring.getMetrics() : [];
};

export const reportPerformance = (): void => {
  if (performanceMonitor) {
    performanceMonitor.reportMetrics();
  }
};

// ===== PERFORMANCE DEBUGGING =====
export const debugPerformance = (): void => {
  console.group('🔍 Performance Debug');
  
  const metrics = getPerformanceMetrics();
  const budget = getBudgetStatus();
  const rum = getRUMMetrics();
  
  console.log('Current Metrics:', metrics);
  console.log('Budget Status:', budget);
  console.log('RUM Data:', rum);
  
  // Show performance timeline
  if (performance.getEntriesByType) {
    console.log('Navigation Timing:', performance.getEntriesByType('navigation'));
    console.log('Resource Timing:', performance.getEntriesByType('resource'));
  }
  
  console.groupEnd();
};

// Make debug function available globally
(window as any).debugPerformance = debugPerformance;

export default {
  initializePerformanceMonitoring,
  getPerformanceMetrics,
  getBudgetStatus,
  getRUMMetrics,
  reportPerformance,
  debugPerformance
};