# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install root & server dependencies
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm --prefix server install
RUN npm --prefix client install

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build client and server
RUN cd server && npx prisma generate --schema=src/db/schema.prisma
RUN cd server && npm run build
RUN cd client && npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY server/package.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/src/db ./server/src/db
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
