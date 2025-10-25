import { db } from '@/db';
import { quotes } from '@/db/schema';

async function main() {
    const sampleQuotes = [
        {
            clientId: 1,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 1, quantity: 1, unit_price: 1500, total: 1500 },
                { service_id: 2, quantity: 2, unit_price: 500, total: 1000 }
            ]),
            subtotal: 2500,
            tax: 325,
            total: 2825,
            status: 'draft',
            pdfUrl: null,
            notes: 'Initial draft for website redesign project',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            clientId: 2,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 3, quantity: 1, unit_price: 2500, total: 2500 }
            ]),
            subtotal: 2500,
            tax: 325,
            total: 2825,
            status: 'draft',
            pdfUrl: null,
            notes: 'E-commerce platform development quote',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            clientId: 3,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 4, quantity: 3, unit_price: 800, total: 2400 },
                { service_id: 5, quantity: 1, unit_price: 1200, total: 1200 }
            ]),
            subtotal: 3600,
            tax: 468,
            total: 4068,
            status: 'sent',
            pdfUrl: 'https://storage.example.com/quotes/quote-3.pdf',
            notes: 'Social media management package for Q1 2024',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            clientId: 4,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 6, quantity: 1, unit_price: 3500, total: 3500 },
                { service_id: 7, quantity: 2, unit_price: 750, total: 1500 }
            ]),
            subtotal: 5000,
            tax: 650,
            total: 5650,
            status: 'sent',
            pdfUrl: 'https://storage.example.com/quotes/quote-4.pdf',
            notes: 'Mobile app development with maintenance package',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-26').toISOString(),
        },
        {
            clientId: 5,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 8, quantity: 1, unit_price: 1800, total: 1800 }
            ]),
            subtotal: 1800,
            tax: 234,
            total: 2034,
            status: 'accepted',
            pdfUrl: 'https://storage.example.com/quotes/quote-5.pdf',
            notes: 'SEO optimization package - approved by client',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            clientId: 6,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 9, quantity: 2, unit_price: 1200, total: 2400 },
                { service_id: 10, quantity: 1, unit_price: 900, total: 900 }
            ]),
            subtotal: 3300,
            tax: 429,
            total: 3729,
            status: 'accepted',
            pdfUrl: 'https://storage.example.com/quotes/quote-6.pdf',
            notes: 'Content creation and brand strategy - client signed off',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            clientId: 7,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 11, quantity: 1, unit_price: 5000, total: 5000 }
            ]),
            subtotal: 5000,
            tax: 650,
            total: 5650,
            status: 'rejected',
            pdfUrl: 'https://storage.example.com/quotes/quote-7.pdf',
            notes: 'Custom CRM system - client decided to go with different vendor',
            createdAt: new Date('2024-02-12').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            clientId: 8,
            userId: 'user-123',
            items: JSON.stringify([
                { service_id: 12, quantity: 4, unit_price: 400, total: 1600 },
                { service_id: 13, quantity: 1, unit_price: 1000, total: 1000 },
                { service_id: 14, quantity: 2, unit_price: 650, total: 1300 }
            ]),
            subtotal: 3900,
            tax: 507,
            total: 4407,
            status: 'expired',
            pdfUrl: 'https://storage.example.com/quotes/quote-8.pdf',
            notes: 'Marketing campaign proposal - expired without response from client',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
    ];

    await db.insert(quotes).values(sampleQuotes);
    
    console.log('✅ Quotes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});