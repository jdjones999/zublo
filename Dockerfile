# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install dependencies using npm (STABLE)
COPY apps/web/package.json apps/web/package-lock.json* ./
RUN npm install

# Copy the frontend source
COPY apps/web/ ./

# Build the frontend using npm
RUN npm run build

# Stage 2: Setup PocketBase and copy frontend
FROM alpine:3.20

WORKDIR /pb

# Install wget for healthcheck
RUN apk add --no-cache wget ca-certificates

# Copy the PocketBase backend files
COPY apps/backend/pb_hooks ./pb_hooks
COPY apps/backend/pb_migrations ./pb_migrations

# Download PocketBase binary
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip

# Copy the built frontend into PocketBase's public folder
COPY --from=frontend-builder /app/dist /pb/pb_public

# Expose port
EXPOSE 9597

# Run PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:9597"]
