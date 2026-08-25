# ── Stage 1: Build the frontend ─────────────────────────────
FROM node:20-alpine AS web-builder

WORKDIR /app

# Install Bun
RUN apk add --no-cache curl && curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy web files and install
COPY apps/web/package.json apps/web/bun.lock* ./
RUN bun install

# Copy the rest of the web app
COPY apps/web/ ./
RUN bun run build


# ── Stage 2: PocketBase backend ─────────────────────────────
FROM alpine:3.20

WORKDIR /pb

# Install needed tools
RUN apk add --no-cache wget ca-certificates unzip

# Copy PocketBase hooks & migrations
COPY apps/backend/pb_hooks ./pb_hooks
COPY apps/backend/pb_migrations ./pb_migrations

# 🔥 CRITICAL: Download the PocketBase binary
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip

# Copy the built frontend into PocketBase's public folder
COPY --from=web-builder /app/dist /pb/pb_public

# Expose port
EXPOSE 9597

# Run PocketBase directly
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:9597"]
