# ── Stage 1: Build the frontend ─────────────────────────────
FROM node:20-alpine AS web-builder

WORKDIR /app

# ✅ SWITCHED TO NPM (No more Bun crashes)
COPY apps/web/package.json apps/web/package-lock.json* ./
RUN npm install

COPY apps/web/ ./
RUN npm run build

# ── Stage 2: PocketBase backend ─────────────────────────────
FROM alpine:3.20

WORKDIR /pb

RUN apk add --no-cache wget ca-certificates unzip

COPY apps/backend/pb_hooks ./pb_hooks
COPY apps/backend/pb_migrations ./pb_migrations

RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip

COPY --from=web-builder /app/dist /pb/pb_public

EXPOSE 9597
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:9597"]
