# Build Stage
FROM node:20-slim AS build

WORKDIR /app

# Install build tools for native modules like sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (frontend + backend)
RUN npm install

# Copy source files
COPY . .

# Set build arguments
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build the frontend
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Install build tools for native modules like sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy server code
COPY --from=build /app/server ./server

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.cjs"]
