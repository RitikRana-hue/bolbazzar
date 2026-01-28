'use client';

import React from 'react';

interface CategoryDropdownProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    value,
    onChange,
    className = '',
    placeholder: _placeholder = 'All Categories'
}) => {
    const categories = [
        'All Categories',
        'Home & Garden',
        'Vehicles',
        'Sports & Recreation',
        'Books & Media',
        'Health & Beauty',
        'Toys & Hobbies',
        'Business & Industrial'
    ];

    return (
        <select
            value={value || 'All Categories'}
            onChange={(e) => onChange?.(e.target.value)}
            className={`text-sm text-gray-600 border-l-2 border-gray-200 px-4 py-4 bg-white outline-none hover:bg-gray-50 transition-colors min-w-[140px] font-medium ${className}`}
        >
            {categories.map(category => (
                <option key={category} value={category}>
                    {category}
                </option>
            ))}
        </select>
    );
};

export default CategoryDropdown;
