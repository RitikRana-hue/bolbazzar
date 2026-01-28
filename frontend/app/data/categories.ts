export const categories = {
    "Home & Garden": [
        "Furniture",
        "Home Decor",
        "Kitchen & Dining",
        "Bedding & Bath",
        "Garden & Outdoor",
        "Tools & Hardware",
        "Appliances",
        "Lighting",
        "Storage & Organization",
        "Home Improvement"
    ],
    "Vehicles": [
        "Cars & Trucks",
        "Motorcycles",
        "Boats & Watercraft",
        "RVs & Campers",
        "Auto Parts",
        "Motorcycle Parts",
        "Tires & Wheels",
        "Tools & Equipment",
        "Classic Cars"
    ],
    "Sports & Recreation": [
        "Exercise Equipment",
        "Outdoor Sports",
        "Team Sports",
        "Water Sports",
        "Winter Sports",
        "Cycling",
        "Golf",
        "Fishing & Hunting",
        "Camping & Hiking",
        "Sports Memorabilia"
    ],
    "Books & Media": [
        "Books",
        "Movies & TV",
        "Music",
        "Magazines",
        "Educational Materials",
        "E-books",
        "Audiobooks",
        "Sheet Music"
    ],
    "Health & Beauty": [
        "Skincare",
        "Makeup & Cosmetics",
        "Hair Care",
        "Fragrances",
        "Health Supplements",
        "Fitness Equipment",
        "Personal Care",
        "Medical Supplies",
        "Natural & Organic",
        "Beauty Tools"
    ],
    "Toys & Hobbies": [
        "Action Figures",
        "Board Games",
        "Building Sets",
        "Dolls & Bears",
        "Educational Toys",
        "Model Kits",
        "Puzzles",
        "Remote Control",
        "Outdoor Toys"
    ],
    "Business & Industrial": [
        "Office Supplies",
        "Industrial Equipment",
        "Restaurant Equipment",
        "Medical Equipment",
        "Construction Tools",
        "Manufacturing",
        "Packaging Materials",
        "Safety Equipment",
        "Test Equipment",
        "Wholesale Lots"
    ]
};

export const popularCategories = [
    "Home & Garden",
    "Vehicles",
    "Sports & Recreation",
    "Books & Media",
    "Health & Beauty",
    "Toys & Hobbies"
];

export const trendingCategories = [
    "Furniture",
    "Cars & Trucks",
    "Exercise Equipment",
    "Books",
    "Skincare",
    "Board Games"
];

export function getCategorySlug(categoryName: string): string {
    return categoryName.toLowerCase()
        .replace(/\s&\s/g, '-')
        .replace(/\s/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

export function getCategoryFromSlug(slug: string): string {
    // Convert slug back to category name
    return slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/-/g, ' & ');
}