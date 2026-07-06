# Backend Dockerfile - Node.js + Express
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/applications

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
