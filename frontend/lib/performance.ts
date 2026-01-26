// Performance optimization utilities

// Lazy load images
export function lazyLoadImage(img: HTMLImageElement): void {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target as HTMLImageElement;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    observer.unobserve(image);
                }
            });
        });

        observer.observe(img);
    } else {
        // Fallback for browsers without IntersectionObserver
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    }
}

// Memoization helper
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

// Debounce with leading edge option
export function debounceAdvanced<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
    const { leading = false, trailing = true } = options;
    let timeout: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        lastArgs = args;

        if (!timeout && leading) {
            func(...args);
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            if (trailing && lastArgs) {
                func(...lastArgs);
            }
            timeout = null;
            lastArgs = null;
        }, wait);
    };
}

// Request Animation Frame throttle
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => void {
    let rafId: number | null = null;

    return (...args: Parameters<T>) => {
        if (rafId !== null) return;

        rafId = requestAnimationFrame(() => {
            fn(...args);
            rafId = null;
        });
    };
}

// Batch updates
export class BatchProcessor<T> {
    private queue: T[] = [];
    private timeout: NodeJS.Timeout | null = null;

    constructor(
        private processor: (items: T[]) => void,
        private delay: number = 100
    ) { }

    add(item: T): void {
        this.queue.push(item);

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.flush();
        }, this.delay);
    }

    flush(): void {
        if (this.queue.length > 0) {
            this.processor([...this.queue]);
            this.queue = [];
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}

// Virtual scroll helper
export function calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 3
): { start: number; end: number } {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(totalItems, start + visibleCount + overscan * 2);

    return { start, end };
}

// Preload resources
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(preloadImage));
}

// Web Worker helper
export function createWorker(fn: Function): Worker {
    const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
}

// Performance monitoring
export class PerformanceMonitor {
    private marks: Map<string, number> = new Map();

    start(label: string): void {
        this.marks.set(label, performance.now());
    }

    end(label: string): number | null {
        const startTime = this.marks.get(label);
        if (!startTime) return null;

        const duration = performance.now() - startTime;
        this.marks.delete(label);

        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    measure(label: string, fn: () => void): number {
        this.start(label);
        fn();
        return this.end(label) || 0;
    }

    async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
        this.start(label);
        await fn();
        return this.end(label) || 0;
    }
}

// Idle callback helper
export function runWhenIdle(callback: () => void, options?: IdleRequestOptions): void {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, options);
    } else {
        setTimeout(callback, 1);
    }
}

// Resource hints
export function addResourceHint(type: 'preconnect' | 'dns-prefetch' | 'prefetch' | 'preload', href: string, as?: string): void {
    const link = document.createElement('link');
    link.rel = type;
    link.href = href;
    if (as) link.setAttribute('as', as);
    document.head.appendChild(link);
}

// Cache with expiration
export class CacheWithExpiry<T> {
    private cache = new Map<string, { value: T; expiry: number }>();

    set(key: string, value: T, ttl: number = 300000): void {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    get(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// Optimize bundle size by code splitting
export function dynamicImport<T>(importFn: () => Promise<T>): Promise<T> {
    return importFn();
}
