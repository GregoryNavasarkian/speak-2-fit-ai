# ---- STAGE 1: Builder ----
FROM node:22 AS builder

WORKDIR /app/server

# Copy server dependencies and install
COPY server/package*.json ./
RUN npm ci

# Copy server source code
COPY server/ ./
RUN npm run build

WORKDIR /app/client

# Copy client dependencies and install
COPY client/package*.json ./
RUN npm ci

# Copy client source code
COPY client/ ./
RUN npm run build

# ---- STAGE 2: Production ----
FROM node:22 AS production

WORKDIR /app

# Copy the server build output
COPY --from=builder /app/server/dist ./dist

# Copy client build output into server's dist/client folder
COPY --from=builder /app/client/dist ./dist/client

# Copy only the package.json for server's production dependencies
COPY server/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
