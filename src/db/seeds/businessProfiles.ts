import { db } from '@/db';
import { businessProfiles } from '@/db/schema';

async function main() {
    const sampleBusinessProfiles = [
        {
            userId: 'user-123',
            businessName: 'PixelCraft Design Studio',
            logoUrl: 'https://storage.example.com/logos/pixelcraft-logo.png',
            currency: 'USD',
            taxRegion: 'California, USA',
            paymentInstructions: 'Payment accepted via bank transfer, credit card, PayPal, or Stripe. Bank details: Account #45782136, Routing #121000248, Swift: CHASUS33. Credit cards accepted: Visa, Mastercard, American Express. Net 30 payment terms apply unless otherwise specified. For expedited processing, use wire transfer.',
            invoiceFooter: 'Thank you for your business! For questions about this invoice, contact billing@pixelcraft.design or call +1-555-234-5678. All services are provided as per our Terms of Service available at pixelcraft.design/terms. Late payments subject to 1.5% monthly interest. Business License #CA-2024-45789.',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        }
    ];

    await db.insert(businessProfiles).values(sampleBusinessProfiles);
    
    console.log('✅ Business profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});