# Railway Dockerfile - CYPHER ORDi Future V3
# Ultra-simplified to avoid any compilation issues

FROM node:18-alpine

# Set working directory  
WORKDIR /app

# Install all dependencies in one step to avoid USB issues
RUN npm install --global npm@latest

# Copy everything except problematic files
COPY package*.json ./

# Set npm to skip optional dependencies globally
RUN npm config set optional false && \
    npm config set fund false && \
    npm config set audit false

# Install production dependencies only, skip all optional packages
RUN npm install --production --ignore-scripts --no-optional --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]