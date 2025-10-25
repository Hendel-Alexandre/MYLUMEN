# 🚀 Supabase Quick Reference

## Import Client

```typescript
import { supabase } from '@/lib/supabase/direct-client'
```

## Common Operations

### SELECT
```typescript
const { data, error } = await supabase.from('clients').select('*')
```

### INSERT
```typescript
const { data, error } = await supabase
  .from('clients')
  .insert([{ name: 'John', email: 'john@example.com' }])
  .select()
```

### UPDATE
```typescript
const { data, error } = await supabase
  .from('clients')
  .update({ name: 'Jane' })
  .eq('id', clientId)
```

### DELETE
```typescript
const { error } = await supabase
  .from('clients')
  .delete()
  .eq('id', clientId)
```

### FILTERS
```typescript
.eq('status', 'active')           // equals
.neq('status', 'deleted')         // not equals
.gt('amount', 100)                // greater than
.gte('amount', 100)               // greater or equal
.lt('amount', 1000)               // less than
.lte('amount', 1000)              // less or equal
.like('name', '%John%')           // pattern match
.ilike('email', '%@gmail.com')    // case-insensitive
.in('status', ['active', 'pending'])
.or('name.eq.John,email.eq.john@example.com')
```

## Storage

### Upload
```typescript
const { data, error } = await supabase
  .storage
  .from('documents')
  .upload('path/file.pdf', file)
```

### Get URL
```typescript
const { data } = supabase
  .storage
  .from('documents')
  .getPublicUrl('path/file.pdf')
```

### Delete
```typescript
const { error } = await supabase
  .storage
  .from('documents')
  .remove(['path/file.pdf'])
```

## Real-Time

```typescript
const subscription = supabase
  .channel('my-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'clients'
  }, (payload) => {
    console.log(payload)
  })
  .subscribe()

// Cleanup
supabase.removeChannel(subscription)
```

## Your Tables
- `clients` - Customer data
- `invoices` - Billing records
- `quotes` - Price quotes
- `products` - Product catalog
- `services` - Service offerings
- `receipts` - Expense receipts
- `payments` - Payment tracking
- `contracts` - Legal documents
- `bookings` - Appointments
- `business_profiles` - Settings

## Resources
- 📖 Full Guide: `SUPABASE_DIRECT_USAGE_GUIDE.md`
- 💻 Code Examples: `src/lib/supabase/usage-examples.ts`
- 🎯 Demo Component: `src/components/examples/SupabaseExample.tsx`
- 🌐 Dashboard: https://fhjknsvhwzrxarbfiqpx.supabase.co
