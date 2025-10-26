import { pgTable, serial, text, numeric, boolean, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';

// Add LumenR financial management tables
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  taxId: text('tax_id'),
  address: text('address'),
  city: text('city'),
  province: text('province'),
  country: text('country'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }),
  autoCalculateTax: boolean('auto_calculate_tax').default(false),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category'),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  stockQuantity: integer('stock_quantity').default(0),
  trackInventory: boolean('track_inventory').default(false),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  category: text('category'),
  duration: integer('duration'),
  active: boolean('active').notNull().default(true),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  items: jsonb('items').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('draft'),
  pdfUrl: text('pdf_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id').references(() => quotes.id, { onDelete: 'set null' }),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  items: jsonb('items').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  depositRequired: boolean('deposit_required').default(false),
  depositAmount: numeric('deposit_amount', { precision: 10, scale: 2 }),
  status: text('status').notNull().default('unpaid'),
  paidAt: timestamp('paid_at', { mode: 'string' }),
  pdfUrl: text('pdf_url'),
  dueDate: timestamp('due_date', { mode: 'string' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  signedByClient: boolean('signed_by_client').default(false),
  signedAt: timestamp('signed_at', { mode: 'string' }),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  vendor: text('vendor').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull().default('expense'), // 'expense' or 'client'
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }), // For client receipts
  imageUrl: text('image_url'), // Renamed from fileUrl for clarity
  notes: text('notes'),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  method: text('method').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  transactionRef: text('transaction_ref'),
  processedAt: timestamp('processed_at', { mode: 'string' }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const businessProfiles = pgTable('business_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  businessName: text('business_name').notNull(),
  logoUrl: text('logo_url'),
  currency: text('currency').notNull().default('USD'),
  taxRegion: text('tax_region'),
  paymentInstructions: text('payment_instructions'),
  invoiceFooter: text('invoice_footer'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  duration: integer('duration').notNull().default(60),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  googleEventId: text('google_event_id'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
});