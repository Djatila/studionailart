/**
 * A/B Testing Framework
 * Studio Nail Art Landing Page
 */

// ===== TYPES =====
interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  traffic: number; // Percentage of users to include (0-100)
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
  targetMetric: string;
}

interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage of test traffic (0-100)
  changes: ABChange[];
}

interface ABChange {
  type: 'text' | 'style' | 'element' | 'attribute';
  selector: string;
  property?: string;
  value: any;
  originalValue?: any;
}

interface ABResult {
  testId: string;
  variantId: string;
  userId: string;
  timestamp: number;
  conversions: number;
  events: string[];
}

// ===== A/B TEST MANAGER =====
class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private results: ABResult[] = [];
  private userId: string;
  
  constructor() {
    this.userId = this.getUserId();
    this.loadTests();
    this.loadUserAssignments();
    this.loadResults();
  }
  
  private getUserId(): string {
    let userId = localStorage.getItem('ab_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_user_id', userId);
    }
    return userId;
  }
  
  private loadTests(): void {
    const stored = localStorage.getItem('ab_tests');
    if (stored) {
      const tests = JSON.parse(stored);
      tests.forEach((test: ABTest) => {
        this.tests.set(test.id, test);
      });
    }
  }
  
  private loadUserAssignments(): void {
    const stored = localStorage.getItem('ab_assignments');
    if (stored) {
      const assignments = JSON.parse(stored);
      Object.entries(assignments).forEach(([userId, userTests]) => {
        this.userAssignments.set(userId, new Map(Object.entries(userTests as any)));
      });
    }
  }
  
  private loadResults(): void {
    const stored = localStorage.getItem('ab_results');
    if (stored) {
      this.results = JSON.parse(stored);
    }
  }
  
  private saveTests(): void {
    const tests = Array.from(this.tests.values());
    localStorage.setItem('ab_tests', JSON.stringify(tests));
  }
  
  private saveUserAssignments(): void {
    const assignments: any = {};
    this.userAssignments.forEach((userTests, userId) => {
      assignments[userId] = Object.fromEntries(userTests);
    });
    localStorage.setItem('ab_assignments', JSON.stringify(assignments));
  }
  
  private saveResults(): void {
    localStorage.setItem('ab_results', JSON.stringify(this.results));
  }
  
  // Create a new A/B test
  public createTest(test: ABTest): void {
    this.tests.set(test.id, test);
    this.saveTests();
  }
  
  // Get user's variant for a test
  public getVariant(testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }
    
    // Check if user is already assigned
    const userTests = this.userAssignments.get(this.userId);
    if (userTests && userTests.has(testId)) {
      return userTests.get(testId) || null;
    }
    
    // Check if user should be included in test
    if (Math.random() * 100 > test.traffic) {
      return null;
    }
    
    // Assign user to variant based on weights
    const variant = this.assignVariant(test);
    
    // Store assignment
    if (!this.userAssignments.has(this.userId)) {
      this.userAssignments.set(this.userId, new Map());
    }
    this.userAssignments.get(this.userId)!.set(testId, variant.id);
    this.saveUserAssignments();
    
    return variant.id;
  }
  
  private assignVariant(test: ABTest): ABVariant {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return test.variants[0];
  }
  
  // Apply variant changes to the page
  public applyVariant(testId: string, variantId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;
    
    variant.changes.forEach(change => {
      this.applyChange(change);
    });
    
    // Track that user saw this variant
    this.trackEvent(testId, variantId, 'variant_shown');
  }
  
  private applyChange(change: ABChange): void {
    const elements = document.querySelectorAll(change.selector);
    
    elements.forEach(element => {
      switch (change.type) {
        case 'text':
          if (element.textContent !== null) {
            change.originalValue = element.textContent;
            element.textContent = change.value;
          }
          break;
          
        case 'style':
          if (change.property && element instanceof HTMLElement) {
            change.originalValue = element.style.getPropertyValue(change.property);
            element.style.setProperty(change.property, change.value);
          }
          break;
          
        case 'attribute':
          if (change.property) {
            change.originalValue = element.getAttribute(change.property);
            element.setAttribute(change.property, change.value);
          }
          break;
          
        case 'element':
          // Replace entire element
          if (typeof change.value === 'string') {
            element.outerHTML = change.value;
          }
          break;
      }
    });
  }
  
  // Track events for A/B test analysis
  public trackEvent(testId: string, variantId: string, event: string): void {
    const existingResult = this.results.find(r => 
      r.testId === testId && r.variantId === variantId && r.userId === this.userId
    );
    
    if (existingResult) {
      existingResult.events.push(event);
      if (event === 'conversion') {
        existingResult.conversions++;
      }
    } else {
      this.results.push({
        testId,
        variantId,
        userId: this.userId,
        timestamp: Date.now(),
        conversions: event === 'conversion' ? 1 : 0,
        events: [event]
      });
    }
    
    this.saveResults();
  }
  
  // Get test results
  public getResults(testId: string): { [variantId: string]: { users: number; conversions: number; rate: number } } {
    const testResults = this.results.filter(r => r.testId === testId);
    const summary: { [variantId: string]: { users: number; conversions: number; rate: number } } = {};
    
    testResults.forEach(result => {
      if (!summary[result.variantId]) {
        summary[result.variantId] = { users: 0, conversions: 0, rate: 0 };
      }
      
      summary[result.variantId].users++;
      summary[result.variantId].conversions += result.conversions;
    });
    
    // Calculate conversion rates
    Object.values(summary).forEach(variant => {
      variant.rate = variant.users > 0 ? (variant.conversions / variant.users) * 100 : 0;
    });
    
    return summary;
  }
  
  // Start a test
  public startTest(testId: string): void {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'running';
      test.startDate = new Date();
      this.saveTests();
    }
  }
  
  // Stop a test
  public stopTest(testId: string): void {
    const test = this.tests.get(testId);
    if (test) {
      test.status = 'completed';
      test.endDate = new Date();
      this.saveTests();
    }
  }
}

// ===== PREDEFINED TESTS =====
export const createHeadlineTest = (): ABTest => ({
  id: 'headline_test_1',
  name: 'Hero Headline Variations',
  traffic: 100,
  status: 'draft',
  targetMetric: 'cta_click',
  variants: [
    {
      id: 'control',
      name: 'Original Headline',
      weight: 50,
      changes: []
    },
    {
      id: 'variant_a',
      name: 'Urgency Focused',
      weight: 25,
      changes: [
        {
          type: 'text',
          selector: 'h1',
          value: 'Pare de PERDER CLIENTES por não ter agenda online! 🚨'
        }
      ]
    },
    {
      id: 'variant_b',
      name: 'Benefit Focused',
      weight: 25,
      changes: [
        {
          type: 'text',
          selector: 'h1',
          value: 'Aumente seus agendamentos em 40% com sua agenda online personalizada ✨'
        }
      ]
    }
  ]
});

export const createCTATest = (): ABTest => ({
  id: 'cta_test_1',
  name: 'CTA Button Variations',
  traffic: 100,
  status: 'draft',
  targetMetric: 'cta_click',
  variants: [
    {
      id: 'control',
      name: 'Original CTA',
      weight: 33,
      changes: []
    },
    {
      id: 'variant_a',
      name: 'Urgency CTA',
      weight: 33,
      changes: [
        {
          type: 'text',
          selector: 'button:contains("Criar Minha Agenda")',
          value: 'Quero Começar AGORA - É Grátis!'
        }
      ]
    },
    {
      id: 'variant_b',
      name: 'Social Proof CTA',
      weight: 34,
      changes: [
        {
          type: 'text',
          selector: 'button:contains("Criar Minha Agenda")',
          value: 'Juntar-se a 500+ Nail Designers'
        }
      ]
    }
  ]
});

export const createColorTest = (): ABTest => ({
  id: 'color_test_1',
  name: 'CTA Button Color Test',
  traffic: 50,
  status: 'draft',
  targetMetric: 'cta_click',
  variants: [
    {
      id: 'control',
      name: 'Original Pink/Purple',
      weight: 50,
      changes: []
    },
    {
      id: 'variant_a',
      name: 'Green CTA',
      weight: 50,
      changes: [
        {
          type: 'style',
          selector: 'button[class*="gradient"]',
          property: 'background',
          value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }
      ]
    }
  ]
});

// ===== INITIALIZATION =====
let abTestManager: ABTestManager;

export const initializeABTesting = (): void => {
  abTestManager = new ABTestManager();
  
  // Create default tests
  abTestManager.createTest(createHeadlineTest());
  abTestManager.createTest(createCTATest());
  abTestManager.createTest(createColorTest());
  
  // Auto-apply active tests
  setTimeout(() => {
    applyActiveTests();
  }, 100);
};

export const applyActiveTests = (): void => {
  if (!abTestManager) return;
  
  const tests = ['headline_test_1', 'cta_test_1', 'color_test_1'];
  
  tests.forEach(testId => {
    const variant = abTestManager.getVariant(testId);
    if (variant) {
      abTestManager.applyVariant(testId, variant);
    }
  });
};

export const trackConversion = (testId?: string): void => {
  if (!abTestManager) return;
  
  const tests = testId ? [testId] : ['headline_test_1', 'cta_test_1', 'color_test_1'];
  
  tests.forEach(id => {
    const variant = abTestManager.getVariant(id);
    if (variant) {
      abTestManager.trackEvent(id, variant, 'conversion');
    }
  });
};

export const getTestResults = (testId: string) => {
  return abTestManager ? abTestManager.getResults(testId) : {};
};

export const startTest = (testId: string): void => {
  if (abTestManager) {
    abTestManager.startTest(testId);
  }
};

export const stopTest = (testId: string): void => {
  if (abTestManager) {
    abTestManager.stopTest(testId);
  }
};

// ===== REACT HOOK =====
export const useABTest = (testId: string) => {
  // Note: This would need React imports in a real React component
  // For now, we'll provide a simple implementation
  let variant: string | null = null;
  
  if (abTestManager) {
    variant = abTestManager.getVariant(testId);
    
    if (variant) {
      abTestManager.applyVariant(testId, variant);
    }
  }
  
  const trackEvent = (event: string) => {
    if (abTestManager && variant) {
      abTestManager.trackEvent(testId, variant, event);
    }
  };
  
  return { variant, trackEvent };
};

export default {
  initializeABTesting,
  applyActiveTests,
  trackConversion,
  getTestResults,
  startTest,
  stopTest,
  useABTest
};