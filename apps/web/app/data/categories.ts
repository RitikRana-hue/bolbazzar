export const categories = {
    "Electronics": [
        "Smartphones & Accessories",
        "Laptops & Computers",
        "Tablets & E-readers",
        "Audio & Headphones",
        "Cameras & Photography",
        "Gaming Consoles",
        "Smart Home Devices",
        "Wearable Technology",
        "Computer Components",
        "Networking Equipment"
    ],
    "Fashion": [
        "Men's Clothing",
        "Women's Clothing",
        "Shoes & Footwear",
        "Bags & Accessories",
        "Jewelry & Watches",
        "Sunglasses & Eyewear",
        "Designer Items",
        "Vintage Fashion",
        "Athletic Wear",
        "Formal Wear"
    ],
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
    "Collectibles & Art": [
        "Trading Cards",
        "Coins & Currency",
        "Stamps",
        "Antiques",
        "Fine Art",
        "Vintage Items",
        "Memorabilia",
        "Books & Manuscripts",
        "Pottery & Glass",
        "Sculptures"
    ],
    "Vehicles": [
        "Cars & Trucks",
        "Motorcycles",
        "Boats & Watercraft",
        "RVs & Campers",
        "Auto Parts",
        "Motorcycle Parts",
        "Tires & Wheels",
        "Car Electronics",
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
        "Video Games",
        "Magazines",
        "Educational Materials",
        "E-books",
        "Audiobooks",
        "Sheet Music",
        "Software"
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
        "Electronic Toys",
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
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Collectibles & Art",
    "Vehicles",
    "Sports & Recreation"
];

export const trendingCategories = [
    "Smartphones & Accessories",
    "Laptops & Computers",
    "Designer Items",
    "Trading Cards",
    "Cars & Trucks",
    "Exercise Equipment"
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