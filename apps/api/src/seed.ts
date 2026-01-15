import { query } from './db';

async function seedDatabase() {
    console.log('🌱 Seeding database...');

    try {
        // Create basic categories
        const categories = [
            {
                id: 'cat_electronics',
                name: 'Electronics',
                slug: 'electronics',
                description: 'Electronic devices and gadgets',
                image: null,
                parentId: null,
                sortOrder: 1
            },
            {
                id: 'cat_fashion',
                name: 'Fashion',
                slug: 'fashion',
                description: 'Clothing, shoes, and accessories',
                image: null,
                parentId: null,
                sortOrder: 2
            },
            {
                id: 'cat_home',
                name: 'Home & Garden',
                slug: 'home-garden',
                description: 'Home improvement and garden supplies',
                image: null,
                parentId: null,
                sortOrder: 3
            },
            {
                id: 'cat_sports',
                name: 'Sports & Outdoors',
                slug: 'sports-outdoors',
                description: 'Sports equipment and outdoor gear',
                image: null,
                parentId: null,
                sortOrder: 4
            },
            {
                id: 'cat_books',
                name: 'Books',
                slug: 'books',
                description: 'Books and educational materials',
                image: null,
                parentId: null,
                sortOrder: 5
            },
            {
                id: 'cat_automotive',
                name: 'Automotive',
                slug: 'automotive',
                description: 'Car parts and automotive accessories',
                image: null,
                parentId: null,
                sortOrder: 6
            }
        ];

        // Insert categories
        for (const category of categories) {
            await query(`
                INSERT INTO categories (
                    id, name, slug, description, image, "parentId", 
                    "sortOrder", "isActive", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
            `, [
                category.id,
                category.name,
                category.slug,
                category.description,
                category.image,
                category.parentId,
                category.sortOrder
            ]);
        }

        // Create subcategories for Electronics
        const electronicsSubcategories = [
            {
                id: 'cat_smartphones',
                name: 'Smartphones',
                slug: 'smartphones',
                description: 'Mobile phones and accessories',
                parentId: 'cat_electronics',
                sortOrder: 1
            },
            {
                id: 'cat_laptops',
                name: 'Laptops',
                slug: 'laptops',
                description: 'Laptops and computer accessories',
                parentId: 'cat_electronics',
                sortOrder: 2
            },
            {
                id: 'cat_headphones',
                name: 'Headphones',
                slug: 'headphones',
                description: 'Audio equipment and headphones',
                parentId: 'cat_electronics',
                sortOrder: 3
            }
        ];

        for (const subcategory of electronicsSubcategories) {
            await query(`
                INSERT INTO categories (
                    id, name, slug, description, image, "parentId", 
                    "sortOrder", "isActive", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
            `, [
                subcategory.id,
                subcategory.name,
                subcategory.slug,
                subcategory.description,
                null,
                subcategory.parentId,
                subcategory.sortOrder
            ]);
        }

        console.log('✅ Database seeded successfully!');
        console.log(`📂 Created ${categories.length} main categories`);
        console.log(`📁 Created ${electronicsSubcategories.length} subcategories`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seed if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('🎉 Seeding complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

export { seedDatabase };