import { db } from '@/db';
import { clients } from '@/db/schema';

async function main() {
    const sampleClients = [
        {
            name: 'Sarah Chen',
            email: 'sarah@techvision.io',
            phone: '+1-555-234-5678',
            company: 'TechVision Solutions',
            taxId: '94-2847361',
            address: '450 Mission Street, San Francisco, CA 94105',
            userId: 'user-123',
            createdAt: new Date('2024-08-15').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
        },
        {
            name: 'Michael Rodriguez',
            email: 'michael@cloudnexus.com',
            phone: '+1-555-876-5432',
            company: 'CloudNexus Technologies',
            taxId: '87-5432198',
            address: '1200 Tech Boulevard, Austin, TX 78701',
            userId: 'user-123',
            createdAt: new Date('2024-09-03').toISOString(),
            updatedAt: new Date('2024-09-03').toISOString(),
        },
        {
            name: 'Emily Thompson',
            email: 'emily@datastream.io',
            phone: '+1-555-345-6789',
            company: 'DataStream Analytics',
            taxId: '76-9876543',
            address: '890 Innovation Drive, Seattle, WA 98101',
            userId: 'user-123',
            createdAt: new Date('2024-07-22').toISOString(),
            updatedAt: new Date('2024-08-10').toISOString(),
        },
        {
            name: 'David Park',
            email: 'david@quantumdev.tech',
            company: 'Quantum Dev Labs',
            phone: '+1-555-987-6543',
            taxId: '65-3456789',
            address: '2100 Silicon Valley Road, Mountain View, CA 94043',
            userId: 'user-123',
            createdAt: new Date('2024-10-05').toISOString(),
            updatedAt: new Date('2024-10-05').toISOString(),
        },
        {
            name: 'Jessica Martinez',
            email: 'jessica@luxelifestyle.com',
            phone: '+1-555-456-7890',
            company: 'Luxe Lifestyle Boutique',
            taxId: '54-7654321',
            address: '789 Fashion Avenue, New York, NY 10001',
            userId: 'user-123',
            createdAt: new Date('2024-08-28').toISOString(),
            updatedAt: new Date('2024-09-15').toISOString(),
        },
        {
            name: 'Robert Johnson',
            email: 'robert@greenmarket.shop',
            phone: '+1-555-234-8765',
            company: 'Green Market Organics',
            taxId: '43-8765432',
            address: '456 Farmers Market Lane, Portland, OR 97201',
            userId: 'user-123',
            createdAt: new Date('2024-09-12').toISOString(),
            updatedAt: new Date('2024-09-12').toISOString(),
        },
        {
            name: 'Amanda Foster',
            email: 'amanda@techgadgets.store',
            phone: '+1-555-678-9012',
            company: 'TechGadgets Pro',
            taxId: '32-9876543',
            address: '1500 Commerce Plaza, Chicago, IL 60601',
            userId: 'user-123',
            createdAt: new Date('2024-07-18').toISOString(),
            updatedAt: new Date('2024-07-18').toISOString(),
        },
        {
            name: 'Christopher Lee',
            email: 'chris@brandelite.agency',
            phone: '+1-555-789-0123',
            company: 'BrandElite Marketing',
            taxId: '21-2345678',
            address: '2500 Marketing Boulevard, Los Angeles, CA 90028',
            userId: 'user-123',
            createdAt: new Date('2024-08-07').toISOString(),
            updatedAt: new Date('2024-09-01').toISOString(),
        },
        {
            name: 'Lauren Williams',
            email: 'lauren@pixelperfect.design',
            phone: '+1-555-890-1234',
            company: 'Pixel Perfect Design Studio',
            taxId: '12-3456789',
            address: '350 Creative Arts Drive, Miami, FL 33101',
            userId: 'user-123',
            createdAt: new Date('2024-09-20').toISOString(),
            updatedAt: new Date('2024-09-20').toISOString(),
        },
        {
            name: 'Thomas Anderson',
            email: 'thomas@strategyconsult.co',
            phone: '+1-555-901-2345',
            company: 'Strategy Consulting Group',
            taxId: '98-7654321',
            address: '1800 Business Center, Boston, MA 02101',
            userId: 'user-123',
            createdAt: new Date('2024-10-01').toISOString(),
            updatedAt: new Date('2024-10-08').toISOString(),
        },
    ];

    await db.insert(clients).values(sampleClients);
    
    console.log('✅ Clients seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});