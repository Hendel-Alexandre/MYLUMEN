import { db } from '@/db';
import { contracts } from '@/db/schema';

async function main() {
    const sampleContracts = [
        {
            clientId: 3,
            userId: 'user-123',
            title: 'Website Development Agreement',
            body: 'This Website Development Agreement is entered into between Sterling Digital Studios and the Client for the provision of comprehensive web development services. The scope of work includes design and development of a responsive website with up to 10 pages, including home, about, services, portfolio, blog, and contact pages. Additional features include contact form integration, SEO optimization, and content management system setup. The project timeline is estimated at 8 weeks with milestones as agreed upon.\n\nPayment terms: 50% deposit ($2,500) upfront upon signing, 25% ($1,250) at design approval milestone, and 25% ($1,250) upon final completion and launch. Total project cost: $5,000. Client agrees to provide all necessary content, images, brand guidelines, and feedback within 2 business days of each milestone presentation. Delays in client feedback may extend the project timeline accordingly.\n\nEither party may terminate this agreement with 14 days written notice. All work remains the property of Sterling Digital Studios until final payment is received in full. Upon completion of payment, all source files and assets will be transferred to the Client. This agreement is governed by the laws of the state of California.',
            signedByClient: true,
            signedAt: new Date('2024-01-22T10:30:00Z').toISOString(),
            pdfUrl: 'https://storage.lumenr.app/contracts/website-dev-003.pdf',
            createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-22T10:30:00Z').toISOString(),
        },
        {
            clientId: 7,
            userId: 'user-123',
            title: 'Brand Identity Design Contract',
            body: 'This Brand Identity Design Contract is entered into between Sterling Digital Studios and the Client for the creation of a complete brand identity package. The scope of work includes logo design (3 initial concepts with 2 rounds of revisions), color palette development, typography selection, brand style guide, business card design, letterhead design, and social media profile graphics. The project timeline is estimated at 6 weeks with clearly defined milestone checkpoints.\n\nPayment terms: 40% deposit ($1,600) upfront upon contract signing, 30% ($1,200) upon logo concept approval, and 30% ($1,200) upon final deliverable package. Total project cost: $4,000. Client agrees to provide comprehensive brand questionnaire, target audience information, competitor analysis, and timely feedback on all design concepts within 3 business days. Rush projects may incur additional fees of 25%.\n\nEither party may terminate this agreement with 14 days written notice. All preliminary designs and concepts remain the intellectual property of Sterling Digital Studios until final payment is completed. Client will receive full ownership rights and source files upon final payment. Confidentiality of all proprietary information will be maintained by both parties.',
            signedByClient: true,
            signedAt: new Date('2024-02-05T14:15:00Z').toISOString(),
            pdfUrl: 'https://storage.lumenr.app/contracts/brand-identity-007.pdf',
            createdAt: new Date('2024-01-28T11:20:00Z').toISOString(),
            updatedAt: new Date('2024-02-05T14:15:00Z').toISOString(),
        },
        {
            clientId: 1,
            userId: 'user-123',
            title: 'SEO Services Agreement',
            body: 'This SEO Services Agreement is entered into between Sterling Digital Studios and the Client for the provision of comprehensive search engine optimization services. The scope of work includes keyword research and analysis, on-page SEO optimization for up to 20 pages, technical SEO audit and fixes, content optimization recommendations, monthly backlink building campaign, competitor analysis, and detailed monthly performance reports. Services will be provided on an ongoing basis for a minimum commitment of 6 months.\n\nPayment terms: Monthly retainer of $1,500 payable on the 1st of each month via automatic payment or invoice. Initial setup fee of $500 is required for comprehensive website audit and strategy development. Client agrees to provide website access credentials, Google Analytics and Search Console access, and approval for content modifications. Results typically begin to show within 3-4 months of consistent optimization efforts.\n\nEither party may terminate this agreement with 30 days written notice after the initial 6-month commitment period. All SEO strategies and proprietary techniques remain confidential intellectual property of Sterling Digital Studios. Monthly reports will track keyword rankings, organic traffic growth, backlink profile, and conversion metrics. Service level agreement guarantees minimum 10% organic traffic increase within 6 months.',
            signedByClient: false,
            signedAt: null,
            pdfUrl: null,
            createdAt: new Date('2024-02-18T08:45:00Z').toISOString(),
            updatedAt: new Date('2024-02-18T08:45:00Z').toISOString(),
        },
        {
            clientId: 5,
            userId: 'user-123',
            title: 'Monthly Retainer Contract',
            body: 'This Monthly Retainer Contract is entered into between Sterling Digital Studios and the Client for ongoing design and development support services. The scope of work includes up to 20 hours per month of combined services including website maintenance, content updates, graphic design work, email marketing templates, social media graphics, and technical support. Hours are allocated on a monthly basis and do not roll over to subsequent months unless otherwise agreed in writing.\n\nPayment terms: Monthly retainer fee of $2,000 payable on the 1st of each month. Payment must be received before work commences each month. Unused hours do not carry forward. Additional hours beyond the monthly allocation will be billed at $120 per hour. Client agrees to submit work requests via designated project management platform with minimum 48-hour notice for standard requests and 5 business days for complex projects.\n\nEither party may terminate this agreement with 30 days written notice. Upon termination, any prepaid retainer for the current month will be prorated based on hours utilized. Rush requests may be accommodated based on availability and may incur additional fees. Priority support is included during standard business hours (9 AM - 6 PM PST, Monday through Friday).',
            signedByClient: true,
            signedAt: new Date('2024-02-10T16:20:00Z').toISOString(),
            pdfUrl: 'https://storage.lumenr.app/contracts/monthly-retainer-005.pdf',
            createdAt: new Date('2024-02-01T13:00:00Z').toISOString(),
            updatedAt: new Date('2024-02-10T16:20:00Z').toISOString(),
        },
        {
            clientId: 9,
            userId: 'user-123',
            title: 'Consulting Services Agreement',
            body: 'This Consulting Services Agreement is entered into between Sterling Digital Studios and the Client for the provision of digital strategy and technology consulting services. The scope of work includes initial business analysis, digital transformation roadmap development, technology stack recommendations, project planning and scoping, vendor evaluation assistance, and ongoing strategic advisory services. Consulting engagement is project-based with estimated completion in 8 weeks, including 4 scheduled strategy sessions and unlimited email support.\n\nPayment terms: 50% deposit ($3,000) upfront upon contract execution, 50% ($3,000) upon delivery of final comprehensive digital strategy document and recommendations. Total consulting fee: $6,000. Client agrees to provide access to relevant stakeholders, current system documentation, business objectives, and budget parameters. Consulting sessions will be scheduled at mutually convenient times with 48-hour cancellation policy.\n\nEither party may terminate this agreement with 14 days written notice. All strategic recommendations, analysis documents, and proprietary methodologies remain confidential and are licensed for Client use only. No third-party disclosure is permitted without written consent. All findings and recommendations are provided in good faith based on information available at time of engagement. Implementation of recommendations is at Client discretion.',
            signedByClient: false,
            signedAt: null,
            pdfUrl: null,
            createdAt: new Date('2024-02-25T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-25T10:30:00Z').toISOString(),
        }
    ];

    await db.insert(contracts).values(sampleContracts);
    
    console.log('✅ Contracts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});