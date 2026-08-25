# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install dependencies
COPY apps/web/package.json apps/web/bun.lock* ./
RUN npm install -g bun
RUN bun install

# Copy the frontend source
COPY apps/web/ ./

# Build the frontend
RUN bun run build

# Stage 2: Setup PocketBase and copy frontend
FROM alpine:3.20

WORKDIR /pb

# Install wget for healthcheck
RUN apk add --no-cache wget ca-certificates

# Copy the PocketBase backend files
COPY apps/backend/pb_hooks ./pb_hooks
COPY apps/backend/pb_migrations ./pb_migrations
COPY apps/backend/entrypoint.sh ./entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Copy the built frontend into PocketBase's public folder
COPY --from=frontend-builder /app/dist /pb/pb_public

# Expose port
EXPOSE 9597

# Run the app
ENTRYPOINT ["./entrypoint.sh"]
