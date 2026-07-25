# Build stage: install deps with bun and produce dist/ (client + bundled server)
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Runtime stage: minimal node image running the bundled server
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Cloud Run injects PORT (defaults to 8080); server.ts reads process.env.PORT
EXPOSE 8080

CMD ["node", "dist/server.cjs"]
