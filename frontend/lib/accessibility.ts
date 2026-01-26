// Accessibility utilities for WCAG compliance

// Focus trap for modals and dialogs
export class FocusTrap {
    private focusableElements: HTMLElement[] = [];
    private firstFocusable: HTMLElement | null = null;
    private lastFocusable: HTMLElement | null = null;
    private previouslyFocused: HTMLElement | null = null;
    
    constructor(private container: HTMLElement) {
        this.updateFocusableElements();
    }
    
    private updateFocusableElements(): void {
        const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        this.focusableElements = Array.from(this.container.querySelectorAll(selector));
        this.firstFocusable = this.focusableElements[0] || null;
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
    }
    
    activate(): void {
        this.previouslyFocused = document.activeElement as HTMLElement;
        this.firstFocusable?.focus();
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    deactivate(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.previouslyFocused?.focus();
    }
    
    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.lastFocusable?.focus();
            }
        } else {
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.firstFocusable?.focus();
            }
        }
    };
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Check color contrast ratio
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
        const [r, g, b] = rgb.map(val => {
            const sRGB = val / 255;
            return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG standards
export function meetsWCAGContrast(
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
): boolean {
    const ratio = getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
        return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

// Keyboard navigation helper
export class KeyboardNavigator {
    constructor(
        private items: HTMLElement[],
        private options: {
            loop?: boolean;
            orientation?: 'horizontal' | 'vertical' | 'both';
        } = {}
    ) {
        this.options.loop = options.loop ?? true;
        this.options.orientation = options.orientation ?? 'vertical';
    }
    
    handleKeyDown(e: KeyboardEvent, currentIndex: number): number {
        const { loop, orientation } = this.options;
        let newIndex = currentIndex;
        
        const isVertical = orientation === 'vertical' || orientation === 'both';
        const isHorizontal = orientation === 'horizontal' || orientation === 'both';
        
        if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
            e.preventDefault();
            newIndex = currentIndex + 1;
            if (newIndex >= this.items.length) {
                newIndex = loop ? 0 : this.items.length - 1;
            }
        } else if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
            e.preventDefault();
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = loop ? this.items.length - 1 : 0;
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = this.items.length - 1;
        }
        
        if (newIndex !== currentIndex) {
            this.items[newIndex]?.focus();
        }
        
        return newIndex;
    }
}

// Skip to content link
export function addSkipLink(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ARIA live region manager
export class LiveRegionManager {
    private regions: Map<string, HTMLElement> = new Map();
    
    createRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (this.regions.has(id)) return;
        
        const region = document.createElement('div');
        region.id = id;
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', priority);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        
        document.body.appendChild(region);
        this.regions.set(id, region);
    }
    
    announce(id: string, message: string): void {
        const region = this.regions.get(id);
        if (!region) {
            this.createRegion(id);
            return this.announce(id, message);
        }
        
        region.textContent = message;
    }
    
    clear(id: string): void {
        const region = this.regions.get(id);
        if (region) {
            region.textContent = '';
        }
    }
    
    remove(id: string): void {
        const region = this.regions.get(id);
        if (region) {
            region.remove();
            this.regions.delete(id);
        }
    }
}

// Accessible modal helper
export function makeModalAccessible(modal: HTMLElement): () => void {
    const focusTrap = new FocusTrap(modal);
    
    // Set ARIA attributes
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Activate focus trap
    focusTrap.activate();
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            cleanup();
        }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Cleanup function
    const cleanup = () => {
        document.body.style.overflow = '';
        focusTrap.deactivate();
        document.removeEventListener('keydown', handleEscape);
    };
    
    return cleanup;
}

// Reduced motion check
export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode check
export function prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
}

// Screen reader detection
export function isScreenReaderActive(): boolean {
    // This is a heuristic and not 100% reliable
    return (
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('VoiceOver')
    );
}

// Generate unique IDs for ARIA relationships
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
    return `${prefix}-${++idCounter}`;
}

// Accessible tooltip
export function createAccessibleTooltip(
    trigger: HTMLElement,
    content: string
): () => void {
    const tooltipId = generateAriaId('tooltip');
    const tooltip = document.createElement('div');
    
    tooltip.id = tooltipId;
    tooltip.role = 'tooltip';
    tooltip.textContent = content;
    tooltip.className = 'absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg';
    tooltip.style.display = 'none';
    
    trigger.setAttribute('aria-describedby', tooltipId);
    document.body.appendChild(tooltip);
    
    const show = () => {
        tooltip.style.display = 'block';
        const rect = trigger.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + 5}px`;
        tooltip.style.left = `${rect.left}px`;
    };
    
    const hide = () => {
        tooltip.style.display = 'none';
    };
    
    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
    
    return () => {
        trigger.removeEventListener('mouseenter', show);
        trigger.removeEventListener('mouseleave', hide);
        trigger.removeEventListener('focus', show);
        trigger.removeEventListener('blur', hide);
        tooltip.remove();
    };
}
