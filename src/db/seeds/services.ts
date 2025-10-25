import { db } from '@/db';
import { services } from '@/db/schema';

async function main() {
    const sampleServices = [
        {
            name: 'Logo Design',
            description: 'Professional logo design including 3 initial concepts, unlimited revisions, and final files in all formats (AI, EPS, PNG, SVG). Includes brand style guide.',
            unitPrice: 500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Brand Identity Package',
            description: 'Complete brand identity including logo, color palette, typography, business cards, letterhead, and brand guidelines. Perfect for new businesses.',
            unitPrice: 2500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Website Design',
            description: 'Custom website design with up to 5 pages, mobile responsive layout, and modern UI/UX. Includes 2 rounds of revisions and design files delivery.',
            unitPrice: 3500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Simple Website Development',
            description: 'Build a professional website with up to 5 pages using modern technologies. Includes responsive design, contact forms, and basic SEO optimization.',
            unitPrice: 1500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'E-commerce Website',
            description: 'Full-featured online store with product catalog, shopping cart, payment gateway integration, and admin dashboard. Includes up to 50 products setup.',
            unitPrice: 4500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Mobile App Development',
            description: 'Native mobile app for iOS and Android platforms. Includes UI/UX design, development, testing, and app store submission. Up to 8 core features.',
            unitPrice: 5000,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Social Media Management',
            description: 'Monthly social media management for up to 3 platforms. Includes content creation, posting schedule, engagement monitoring, and monthly analytics report.',
            unitPrice: 800,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'SEO Audit',
            description: 'Comprehensive SEO audit covering technical SEO, on-page optimization, and competitor analysis. Includes detailed report with actionable recommendations.',
            unitPrice: 750,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Content Marketing Strategy',
            description: 'Custom content marketing strategy including audience research, content calendar, topic ideation, and distribution channels. 3-month implementation plan.',
            unitPrice: 1200,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Business Consulting',
            description: 'One-on-one business consulting session to discuss strategy, operations, or growth challenges. Includes pre-session preparation and follow-up summary.',
            unitPrice: 250,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        },
        {
            name: 'Strategy Session',
            description: '2-hour deep-dive strategy session covering business goals, market positioning, and growth opportunities. Includes strategic action plan document.',
            unitPrice: 500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Marketing Workshop',
            description: 'Half-day marketing workshop for your team covering digital marketing fundamentals, campaign planning, and measurement. For up to 10 participants.',
            unitPrice: 1500,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        },
        {
            name: 'Professional Copywriting',
            description: 'Professional copywriting for website pages, landing pages, or marketing materials. Up to 1000 words with 2 rounds of revisions included.',
            unitPrice: 200,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            name: 'Video Production',
            description: 'Professional video production including scripting, filming, editing, and color grading. Perfect for promotional or explainer videos up to 3 minutes.',
            unitPrice: 3000,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-12').toISOString(),
            updatedAt: new Date('2024-02-12').toISOString(),
        },
        {
            name: 'Photography Session',
            description: 'Professional photography session for products, portraits, or business premises. Includes 3 hours of shooting and 20 edited high-resolution images.',
            unitPrice: 800,
            currency: 'USD',
            userId: 'user-123',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        }
    ];

    await db.insert(services).values(sampleServices);
    
    console.log('✅ Services seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});