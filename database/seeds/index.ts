import { seedDemoData } from './demo-data.js';

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        await seedDemoData();
        console.log('✅ Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}

main();
