FROM node:20-bookworm-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-bookworm-slim AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# BSON tools are required for mongodump/mongorestore endpoints.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl tar; \
    if ! apt-get install -y --no-install-recommends mongodb-database-tools; then \
      arch="$(dpkg --print-architecture)"; \
      case "$arch" in \
        amd64) tools_arch="x86_64" ;; \
        arm64) tools_arch="arm64" ;; \
        *) echo "Unsupported architecture: $arch"; exit 1 ;; \
      esac; \
      tools_version="100.10.0"; \
      curl -fsSL "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-${tools_arch}-${tools_version}.tgz" -o /tmp/mongodb-tools.tgz; \
      tar -xzf /tmp/mongodb-tools.tgz -C /tmp; \
      cp /tmp/mongodb-database-tools-*/bin/mongodump /usr/local/bin/; \
      cp /tmp/mongodb-database-tools-*/bin/mongorestore /usr/local/bin/; \
      rm -rf /tmp/mongodb-tools.tgz /tmp/mongodb-database-tools-*; \
    fi; \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server ./server
COPY data ./data
COPY schemas ./schemas
COPY --from=client-build /app/client/dist ./client/dist

RUN mkdir -p /app/backup

EXPOSE 3001
CMD ["node", "server/index.js"]
