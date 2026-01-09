/**
 * Mobile Gesture Support Utilities
 * Studio Nail Art Landing Page
 */

// ===== TOUCH EVENT INTERFACES =====
interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
  velocity: number;
}

// ===== SWIPE GESTURE HANDLER =====
export class SwipeHandler {
  private element: HTMLElement;
  private startTouch: TouchPoint | null = null;
  private threshold: number;
  private maxTime: number;
  private minDistance: number;
  
  constructor(
    element: HTMLElement,
    options: {
      threshold?: number;
      maxTime?: number;
      minDistance?: number;
    } = {}
  ) {
    this.element = element;
    this.threshold = options.threshold || 50;
    this.maxTime = options.maxTime || 500;
    this.minDistance = options.minDistance || 30;
    
    this.init();
  }
  
  private init(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }
  
  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.startTouch = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }
  
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.startTouch) return;
    
    const touch = e.changedTouches[0];
    const endTouch: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
    
    const swipeEvent = this.calculateSwipe(this.startTouch, endTouch);
    if (swipeEvent) {
      this.dispatchSwipeEvent(swipeEvent);
    }
    
    this.startTouch = null;
  }
  
  private calculateSwipe(start: TouchPoint, end: TouchPoint): SwipeEvent | null {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const duration = end.timestamp - start.timestamp;
    
    if (duration > this.maxTime) return null;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < this.minDistance) return null;
    
    const velocity = distance / duration;
    
    // Determine direction
    let direction: SwipeEvent['direction'];
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    return {
      direction,
      distance,
      duration,
      velocity
    };
  }
  
  private dispatchSwipeEvent(swipeEvent: SwipeEvent): void {
    const customEvent = new CustomEvent('swipe', {
      detail: swipeEvent
    });
    this.element.dispatchEvent(customEvent);
  }
  
  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

// ===== PULL TO REFRESH =====
export class PullToRefresh {
  private element: HTMLElement;
  private threshold: number;
  private onRefresh: () => Promise<void>;
  private isRefreshing: boolean = false;
  private startY: number = 0;
  private currentY: number = 0;
  
  constructor(
    element: HTMLElement,
    onRefresh: () => Promise<void>,
    threshold: number = 80
  ) {
    this.element = element;
    this.onRefresh = onRefresh;
    this.threshold = threshold;
    
    this.init();
  }
  
  private init(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  private handleTouchStart(e: TouchEvent): void {
    if (this.element.scrollTop > 0) return;
    this.startY = e.touches[0].clientY;
  }
  
  private handleTouchMove(e: TouchEvent): void {
    if (this.isRefreshing || this.element.scrollTop > 0) return;
    
    this.currentY = e.touches[0].clientY;
    const pullDistance = this.currentY - this.startY;
    
    if (pullDistance > 0) {
      e.preventDefault();
      
      // Visual feedback
      const progress = Math.min(pullDistance / this.threshold, 1);
      this.updatePullIndicator(progress);
    }
  }
  
  private handleTouchEnd(): void {
    if (this.isRefreshing) return;
    
    const pullDistance = this.currentY - this.startY;
    
    if (pullDistance >= this.threshold) {
      this.triggerRefresh();
    } else {
      this.resetPullIndicator();
    }
  }
  
  private updatePullIndicator(progress: number): void {
    const indicator = this.element.querySelector('.pull-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.transform = `translateY(${progress * 50}px) scale(${progress})`;
      indicator.style.opacity = progress.toString();
    }
  }
  
  private async triggerRefresh(): Promise<void> {
    this.isRefreshing = true;
    
    try {
      await this.onRefresh();
    } finally {
      this.isRefreshing = false;
      this.resetPullIndicator();
    }
  }
  
  private resetPullIndicator(): void {
    const indicator = this.element.querySelector('.pull-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.transform = 'translateY(0) scale(0)';
      indicator.style.opacity = '0';
    }
  }
}

// ===== TOUCH RIPPLE EFFECT =====
export const addTouchRipple = (element: HTMLElement): void => {
  element.addEventListener('touchstart', (e: TouchEvent) => {
    const rect = element.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    // Ensure element has relative positioning
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }, { passive: true });
};

// ===== SMOOTH SCROLL TO ELEMENT =====
export const smoothScrollToElement = (
  targetId: string,
  offset: number = 0,
  duration: number = 800
): void => {
  const target = document.getElementById(targetId);
  if (!target) return;
  
  const targetPosition = target.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;
  
  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };
  
  requestAnimationFrame(animation);
};

// Easing function for smooth scroll
const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

// ===== HAPTIC FEEDBACK =====
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// ===== MOBILE MENU HANDLER =====
export class MobileMenuHandler {
  private menuButton: HTMLElement;
  private menu: HTMLElement;
  private overlay: HTMLElement;
  private isOpen: boolean = false;
  
  constructor(menuButton: HTMLElement, menu: HTMLElement, overlay?: HTMLElement) {
    this.menuButton = menuButton;
    this.menu = menu;
    this.overlay = overlay || this.createOverlay();
    
    this.init();
  }
  
  private init(): void {
    this.menuButton.addEventListener('click', this.toggle.bind(this));
    this.overlay.addEventListener('click', this.close.bind(this));
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Handle swipe to close
    const swipeHandler = new SwipeHandler(this.menu);
    this.menu.addEventListener('swipe', (e: CustomEvent) => {
      if (e.detail.direction === 'left' && this.isOpen) {
        this.close();
      }
    });
  }
  
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 99;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }
  
  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  public open(): void {
    this.isOpen = true;
    this.menu.classList.add('menu-open');
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';
    document.body.classList.add('no-scroll');
    
    triggerHapticFeedback('light');
  }
  
  public close(): void {
    this.isOpen = false;
    this.menu.classList.remove('menu-open');
    this.overlay.style.opacity = '0';
    this.overlay.style.visibility = 'hidden';
    document.body.classList.remove('no-scroll');
    
    triggerHapticFeedback('light');
  }
}

// ===== INITIALIZATION HELPERS =====
export const initializeMobileGestures = (): void => {
  // Add ripple effect to all buttons
  document.querySelectorAll('button, [role="button"]').forEach(button => {
    addTouchRipple(button as HTMLElement);
  });
  
  // Add CSS for ripple animation
  if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple-animation {
        to {
          width: 100px;
          height: 100px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// ===== TOUCH OPTIMIZATION =====
export const optimizeForTouch = (): void => {
  // Disable 300ms click delay on mobile
  document.addEventListener('touchstart', () => {}, { passive: true });
  
  // Prevent zoom on double tap for specific elements
  document.querySelectorAll('button, [role="button"], .no-zoom').forEach(element => {
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      (element as HTMLElement).click();
    });
  });
  
  // Add touch-action CSS where needed
  document.querySelectorAll('.swipeable').forEach(element => {
    (element as HTMLElement).style.touchAction = 'pan-y';
  });
  
  document.querySelectorAll('.swipeable-horizontal').forEach(element => {
    (element as HTMLElement).style.touchAction = 'pan-x';
  });
};

export default {
  SwipeHandler,
  PullToRefresh,
  MobileMenuHandler,
  addTouchRipple,
  smoothScrollToElement,
  triggerHapticFeedback,
  initializeMobileGestures,
  optimizeForTouch
};