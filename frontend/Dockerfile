FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:8000/api

# Run application
CMD ["npm", "start"]
