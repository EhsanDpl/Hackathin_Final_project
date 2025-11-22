# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build NestJS application
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Start the NestJS application
CMD ["node", "dist/main.js"]

