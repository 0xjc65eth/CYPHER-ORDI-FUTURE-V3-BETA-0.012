# Multi-stage Dockerfile for CYPHER ORDi Future V3
# Optimized for production deployment with security and performance

# Build stage
FROM node:18-alpine AS builder

LABEL maintainer="CYPHER ORDi Team <dev@cypher-ordi.com>"
LABEL version="3.0.0"
LABEL description="CYPHER ORDi Future V3 - Advanced Cryptocurrency Trading Platform"

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S cypher && \
    adduser -S cypher -u 1001 -G cypher

# Install runtime dependencies and security updates
RUN apk update && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=cypher:cypher /app/node_modules ./node_modules
COPY --from=builder --chown=cypher:cypher /app/dist ./dist
COPY --from=builder --chown=cypher:cypher /app/package*.json ./

# Copy additional files - removed non-existent files for Railway deployment
# COPY --chown=cypher:cypher README.md ./
# COPY --chown=cypher:cypher CLAUDE.md ./

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/temp && \
    chown -R cypher:cypher /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4444
ENV WS_PORT=8080
ENV METRICS_PORT=9090
ENV LOG_LEVEL=info

# Expose ports
EXPOSE 4444 8080 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4444/health || exit 1

# Switch to non-root user
USER cypher

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# Development stage
FROM node:18-alpine AS development

# Install development tools
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    vim \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Create user and set permissions
RUN addgroup -g 1001 -S cypher && \
    adduser -S cypher -u 1001 -G cypher && \
    chown -R cypher:cypher /app

# Set environment
ENV NODE_ENV=development
ENV PORT=4444
ENV WS_PORT=8080
ENV METRICS_PORT=9090

# Expose ports
EXPOSE 4444 8080 9090 9229

# Switch to non-root user
USER cypher

# Start in development mode with hot reload
CMD ["npm", "run", "dev"]

# Testing stage
FROM development AS testing

# Switch back to root for installing test tools
USER root

# Install testing dependencies
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver

# Set Chrome environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

# Switch back to cypher user
USER cypher

# Run tests
CMD ["npm", "test"]

# Security scanning stage
FROM builder AS security

# Install security scanning tools
USER root
RUN npm install -g audit-ci retire

# Run security audit
RUN npm audit --audit-level=moderate
RUN retire --path ./node_modules --outputformat json --outputpath security-report.json || true

# Production with security hardening
FROM production AS secure

# Additional security measures
USER root

# Remove package managers and build tools
RUN apk del --purge apk-tools

# Remove shells and other potentially dangerous binaries
RUN rm -rf \
    /bin/sh \
    /usr/bin/wget \
    /usr/bin/nc \
    /usr/bin/telnet \
    /etc/apk

# Create a minimal shell script for health checks
RUN echo '#!/bin/ash' > /bin/health-check && \
    echo 'curl -f http://localhost:4444/health' >> /bin/health-check && \
    chmod +x /bin/health-check

# Update health check to use custom script
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/bin/health-check"]

# Set read-only root filesystem
# Note: This would be done at runtime with Docker run flags
# docker run --read-only --tmpfs /tmp --tmpfs /var/log

USER cypher

# Final production-ready image
FROM secure AS final

# Metadata labels
LABEL org.opencontainers.image.title="CYPHER ORDi Future V3"
LABEL org.opencontainers.image.description="Advanced cryptocurrency trading platform with 24 microservices"
LABEL org.opencontainers.image.version="3.0.0"
LABEL org.opencontainers.image.vendor="CYPHER ORDi"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/cypher-ordi/future-v3"

# Runtime configuration
# VOLUME removed for Railway compatibility - use Railway volumes instead
# Create directories for potential volume mounting
RUN mkdir -p /app/logs /app/data

# Signal handling
STOPSIGNAL SIGTERM

# Default command
CMD ["node", "dist/server.js"]