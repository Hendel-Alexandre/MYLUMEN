# Database Migrations Guide

This document explains how to use Drizzle ORM migrations in the LumenR project.

## Overview

LumenR uses **Drizzle ORM** with **Turso (LibSQL)** for database management. Migrations allow you to evolve your database schema safely over time.

## Migration Workflow

### 1. Development Workflow (Quick Iteration)

For rapid development, you can push schema changes directly:

```bash
bun run db:push
```

⚠️ **Warning**: This bypasses migrations and directly modifies the database. Use only in development.

### 2. Production Workflow (Safe Migrations)

For production or when you need version control:

#### Step 1: Modify Schema
Edit `src/db/schema.ts` to add/modify tables or columns.

#### Step 2: Generate Migration
```bash
bun run db:generate
# OR with custom name
./scripts/generate-migration.sh add_payment_methods
```

This creates a new migration file in `./drizzle` directory.

#### Step 3: Review Migration
Check the generated SQL in `./drizzle` to ensure it's correct.

#### Step 4: Apply Migration
```bash
bun run db:migrate
# OR
./scripts/migrate.sh
```

This applies all pending migrations to your database.

### 3. Database Studio

To visualize and manage your database:

```bash
bun run db:studio
# OR
./scripts/db-studio.sh
```

Opens Drizzle Studio in your browser at `https://local.drizzle.studio`

## Common Scenarios

### Adding a New Table

1. Add table definition to `src/db/schema.ts`:
```typescript
export const newTable = sqliteTable('new_table', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});
```

2. Generate and apply migration:
```bash
bun run db:generate
bun run db:migrate
```

### Adding a Column

1. Add column to existing table in `src/db/schema.ts`:
```typescript
export const users = sqliteTable('users', {
  // ... existing columns
  newColumn: text('new_column'),
});
```

2. Generate and apply migration:
```bash
bun run db:generate
bun run db:migrate
```

### Renaming or Dropping Columns

⚠️ **Caution**: These operations can cause data loss.

1. Modify schema
2. Generate migration
3. **Review the SQL carefully**
4. Backup your database
5. Apply migration

## Migration Files

Migrations are stored in `./drizzle` directory with format:
```
0000_migration_name.sql
```

Each migration file contains:
- SQL statements to apply changes
- Metadata about the migration

## Environment-Specific Migrations

### Development
```bash
DATABASE_URL=file:./local.db bun run db:migrate
```

### Staging
```bash
DATABASE_URL=<staging_url> DATABASE_AUTH_TOKEN=<token> bun run db:migrate
```

### Production
```bash
DATABASE_URL=<prod_url> DATABASE_AUTH_TOKEN=<token> bun run db:migrate
```

## Best Practices

1. **Always generate migrations** for production changes
2. **Review migrations** before applying
3. **Test migrations** in development/staging first
4. **Backup database** before applying migrations in production
5. **Never modify** applied migration files
6. **Use semantic names** for migrations (e.g., `add_user_roles`, `update_invoice_status`)
7. **Keep migrations atomic** - one logical change per migration
8. **Document breaking changes** in migration files

## Rollback Strategy

Drizzle doesn't have automatic rollback. For important migrations:

1. Create a backup:
```bash
# For Turso
turso db shell <db-name> .dump > backup.sql
```

2. If migration fails, restore from backup
3. Fix the schema and regenerate migration

## CI/CD Integration

Migrations run automatically in CI/CD pipeline:

```yaml
- name: Run migrations
  run: bun run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DATABASE_AUTH_TOKEN: ${{ secrets.DATABASE_AUTH_TOKEN }}
```

## Troubleshooting

### Migration Failed
- Check database connection
- Review migration SQL for errors
- Ensure database user has sufficient permissions
- Check for conflicting schema changes

### Schema Mismatch
Run Drizzle Studio to inspect actual vs expected schema:
```bash
bun run db:studio
```

### Reset Development Database
⚠️ **Destructive**: Only for development
```bash
rm local.db
bun run db:push
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `bun run db:generate` | Generate migration from schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:push` | Push schema directly (dev only) |
| `bun run db:studio` | Open Drizzle Studio |
| `./scripts/generate-migration.sh <name>` | Generate named migration |
| `./scripts/migrate.sh` | Apply migrations with logging |
| `./scripts/db-push.sh` | Push with confirmation prompt |
| `./scripts/db-studio.sh` | Open studio with logging |

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Turso Documentation](https://docs.turso.tech)
- [LibSQL Documentation](https://github.com/libsql/libsql)
