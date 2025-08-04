# ------------------------------------------------------------------------------
# ---- BASE STAGE ----
# ------------------------------------------------------------------------------
FROM node:23-alpine3.20 AS base

# Set environment variables
ENV COREPACK_ENABLE_NETWORK_VERIFY=false \
	TURBO_TELEMETRY_DISABLED=1 \
	PNPM_HOME=/usr/local/bin \
	PORT=3000

# Enable corepack and prepare pnpm
RUN corepack enable && \
    corepack prepare pnpm@latest-10 --activate

# ------------------------------------------------------------------------------
# ---- PRUNE STAGE ----
# ------------------------------------------------------------------------------
FROM base AS prune

WORKDIR /app

# Install turbo
RUN pnpm add --global turbo@latest

# Copy all project files (.dockerignore will ignore copying unnecessary files)
COPY . .
RUN turbo prune web --docker

# ------------------------------------------------------------------------------
# ---- INSTALL DEPENDENCIES STAGE ----
# ------------------------------------------------------------------------------
FROM prune AS deps

WORKDIR /app

# Install dependencies and build the application
# (Copy only lockfiles and JSON output to avoid cache invalidation)
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# TODO: when adding --prod, modules in devDependencies should be moved to dependencies
RUN pnpm install

# ------------------------------------------------------------------------------
# ---- BUILD STAGE ----
# ------------------------------------------------------------------------------
FROM deps AS build

WORKDIR /app

# Copy full pruned source and build
COPY --from=deps /app/out/full/ .

# Copy the appropriate .env based on NODE_ENV and remove the rest of .env files
COPY apps/web/.env.development apps/web/.env
RUN rm apps/web/.env.*

# Build the application
RUN turbo --filter=web build

# ------------------------------------------------------------------------------
# ---- RUNTIME STAGE ----
# ------------------------------------------------------------------------------
FROM base AS runtime

WORKDIR /app

# Create a non-root user and group for enhanced security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only production files from the builder stage
COPY --from=build /app/apps/web/next.config.ts .
COPY --from=build /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Install production dependencies
# RUN pnpm install && pnpm prune --prod

# Change ownership of the app directory to the nextjs user
RUN chown -R nextjs:nodejs /app

EXPOSE 3000

USER nextjs

CMD ["node", "apps/web/server.js"]
