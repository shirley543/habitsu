# --- Build Environment ---

# Use the official Node.js image as the base image
FROM node:20 AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy workspace manifests first (better layer caching) to the working directory
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/validation-schemas/package.json packages/validation-schemas/package.json

# Install the application dependencies (clean-install from package-lock.json)
RUN npm ci

# Copy source for both workspaces
COPY packages/validation-schemas packages/validation-schemas
COPY apps/backend apps/backend

# Build shared package first, then Prisma client, then backend
RUN npm run build -w @habit-tracker/validation-schemas
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build -w @habit-tracker/backend

# --- Production Runtime ---
FROM node:20
WORKDIR /usr/src/app

# Copy the rest of the application files
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/validation-schemas ./packages/validation-schemas
COPY --from=builder /usr/src/app/apps/backend ./apps/backend

# Set the working directory inside the container
WORKDIR /usr/src/app/apps/backend

# Expose the application port
EXPOSE 3000

# Run pending Prisma migrations, then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]