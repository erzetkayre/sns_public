FROM node:22-slim

WORKDIR /app

# Install dependencies first (cacheable)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client during build so it's available at runtime
RUN npx prisma generate || true

EXPOSE 5001
CMD ["npm", "run", "dev"]