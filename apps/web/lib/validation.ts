// Form validation utilities
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface ValidationErrors {
    [key: string]: string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
    }

    // String validations
    if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
            return `Must be at least ${rules.minLength} characters`;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            return `Must be no more than ${rules.maxLength} characters`;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            return 'Invalid format';
        }
    }

    // Number validations
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            return `Must be at least ${rules.min}`;
        }

        if (rules.max !== undefined && value > rules.max) {
            return `Must be no more than ${rules.max}`;
        }
    }

    // Custom validation
    if (rules.custom) {
        return rules.custom(value);
    }

    return null;
}

export function validateForm(data: any, rules: ValidationRules): ValidationErrors {
    const errors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
        const error = validateField(data[field], rules[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
}

// Common validation patterns
export const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    url: /^https?:\/\/.+/,
    zipCode: /^\d{5}(-\d{4})?$/,
    creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
    cvv: /^\d{3,4}$/,
};

// Common validation rules
export const commonRules = {
    email: {
        required: true,
        pattern: patterns.email,
        maxLength: 255,
    },
    password: {
        required: true,
        minLength: 8,
        pattern: patterns.password,
    },
    confirmPassword: (password: string) => ({
        required: true,
        custom: (value: string) => {
            if (value !== password) {
                return 'Passwords do not match';
            }
            return null;
        },
    }),
    phone: {
        pattern: patterns.phone,
        minLength: 10,
        maxLength: 15,
    },
    required: {
        required: true,
    },
    optionalEmail: {
        pattern: patterns.email,
        maxLength: 255,
    },
    price: {
        required: true,
        min: 0.01,
        max: 999999.99,
    },
    positiveNumber: {
        required: true,
        min: 1,
    },
    url: {
        pattern: patterns.url,
        maxLength: 500,
    },
};

// Form field validation hook
import { useState, useCallback } from 'react';

export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    validationRules: ValidationRules
) {
    const [data, setData] = useState<T>(initialData);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateSingleField = useCallback((field: string, value: any) => {
        if (validationRules[field]) {
            const error = validateField(value, validationRules[field]);
            setErrors(prev => ({
                ...prev,
                [field]: error || '',
            }));
            return !error;
        }
        return true;
    }, [validationRules]);

    const validateAllFields = useCallback(() => {
        const newErrors = validateForm(data, validationRules);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data, validationRules]);

    const updateField = useCallback((field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));

        // Validate field if it has been touched
        if (touched[field]) {
            validateSingleField(field, value);
        }
    }, [touched, validateSingleField]);

    const touchField = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateSingleField(field, data[field]);
    }, [data, validateSingleField]);

    const reset = useCallback(() => {
        setData(initialData);
        setErrors({});
        setTouched({});
    }, [initialData]);

    const isValid = Object.keys(errors).every(key => !errors[key]);

    return {
        data,
        errors,
        touched,
        isValid,
        updateField,
        touchField,
        validateAllFields,
        reset,
    };
}