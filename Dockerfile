# === Base stage for building the application ===
FROM node:18-alpine AS builder

# Set environment variables to reduce warnings
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (only production dependencies)
RUN npm install --omit=dev

# Copy the rest of the application files to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# === Final stage for running the application ===
FROM node:18-alpine

# Set environment variables for production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port that the Next.js app will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]
