Node.js Express Backend (TODOs reword and combine with backend README.md)

# Getting Started

To run this application for development:

```bash
npm run dev
```


# Building For Production

To build this application for production:

```bash
npm run build
npm start
```

# Introspect DB
Updates Prisma schema to match Database schema
```bash
npx prisma db pull
```

# Baseline Migration
Baselining refers to initializing your migration history for a database that might already contain data and cannot be reset, such as your production database. Baselining tells Prisma Migrate to assume that one or more migrations have already been applied to your database.

Migrates Database schema to match Prisma schema. Steps below:

1. Make migrations directory
```bash
mkdir -p prisma/migrations/0_init
```

2. Generate migration file, after modifying Prisma schema, with `prisma migrate diff`
Arguments below:
`--from-empty`: assumes the data model you're migrating from is empty
`--to-schema-datamodel`: the current database state using the URL in the datasource block
`--script`: output a SQL script

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```

3. Mark migration as applied, which will add migration `0_init` to the `_prisma_migrations` table
```bash
npx prisma migrate resolve --applied 0_init
```

4. To make further changes to database schema (after baselining), can update Prisma schema and then use
`prisma migrate dev` to apply the changes to the database

# Prisma Client Generate
After installing Prisma Client package, each time you modify your Prisma schema, you also need to update the Prisma Client via
`npx prisma generate`

Whenever you update your Prisma schema, you also need to update your database schema using either:
`prisma migrate dev` or `prisma db push` to keep the database schema in sync with your Prisma schema.
Note that these commands will also run `prisma` generate under the hood to re-generate your Prisma client.