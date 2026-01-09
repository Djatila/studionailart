/**
 * Performance Optimization Utilities
 * Studio Nail Art Landing Page
 */

// ===== LAZY LOADING UTILITIES =====

/**
 * Lazy load images with intersection observer
 */
export const setupLazyLoading = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the actual image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Load srcset if available
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Remove loading class and add loaded class
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.classList.add('lazy-loading');
      imageObserver.observe(img);
    });
  }
};

/**
 * Lazy load content sections
 */
export const setupContentLazyLoading = (): void => {
  if ('IntersectionObserver' in window) {
    const contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.classList.add('content-loaded');
          
          // Trigger any data loading if needed
          const loadEvent = new CustomEvent('contentVisible', {
            detail: { element }
          });
          element.dispatchEvent(loadEvent);
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.1
    });

    // Observe all lazy content
    document.querySelectorAll('[data-lazy-content]').forEach(element => {
      contentObserver.observe(element);
    });
  }
};

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====

/**
 * Setup scroll-triggered animations
 */
export const setupScrollAnimations = (): void => {
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const animationClass = element.dataset.animation || 'animate-fade-in-up';
          const delay = element.dataset.delay || '0';
          
          // Apply delay if specified
          if (delay !== '0') {
            setTimeout(() => {
              element.classList.add(animationClass);
            }, parseInt(delay));
          } else {
            element.classList.add(animationClass);
          }
          
          // Stop observing after animation is triggered
          animationObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    });

    // Observe all elements with scroll animations
    document.querySelectorAll('[data-scroll-animation]').forEach(element => {
      animationObserver.observe(element);
    });
  }
};

// ===== IMAGE OPTIMIZATION =====

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (basePath: string, sizes: number[]): string => {
  return sizes.map(size => `${basePath}?w=${size} ${size}w`).join(', ');
};

/**
 * Create optimized image element
 */
export const createOptimizedImage = (
  src: string,
  alt: string,
  sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className: string = ''
): HTMLImageElement => {
  const img = document.createElement('img');
  
  // Set up lazy loading
  img.dataset.src = src;
  img.alt = alt;
  img.className = `lazy-loading ${className}`;
  
  // Add responsive sizes
  const imageSizes = [400, 800, 1200, 1600];
  img.dataset.srcset = generateSrcSet(src, imageSizes);
  img.sizes = sizes;
  
  // Add loading placeholder
  img.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  img.style.minHeight = '200px';
  
  return img;
};

// ===== PERFORMANCE MONITORING =====

/**
 * Monitor Core Web Vitals
 */
export const setupPerformanceMonitoring = (): void => {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if needed
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Performance'
          });
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any;
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fidEntry.processingStart - fidEntry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries: any[] = [];

  if ('PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            clsEntries.push(entry);
          }
        });
        
        console.log('CLS:', clsValue);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance'
          });
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }
  }
};

// ===== RESOURCE PRELOADING =====

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (): void => {
  const criticalResources = [
    { href: '/src/styles/design-system.css', as: 'style' },
    { href: '/src/styles/grid-system.css', as: 'style' },
    { href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap', as: 'style' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.as === 'style') {
      link.onload = () => {
        link.rel = 'stylesheet';
      };
    }
    document.head.appendChild(link);
  });
};

// ===== DEBOUNCE AND THROTTLE UTILITIES =====

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== INITIALIZATION =====

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLazyLoading();
      setupContentLazyLoading();
      setupScrollAnimations();
      setupPerformanceMonitoring();
    });
  } else {
    setupLazyLoading();
    setupContentLazyLoading();
    setupScrollAnimations();
    setupPerformanceMonitoring();
  }
  
  // Preload critical resources immediately
  preloadCriticalResources();
};

// ===== TYPE DECLARATIONS =====
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default {
  setupLazyLoading,
  setupContentLazyLoading,
  setupScrollAnimations,
  setupPerformanceMonitoring,
  preloadCriticalResources,
  debounce,
  throttle,
  initializePerformanceOptimizations
};