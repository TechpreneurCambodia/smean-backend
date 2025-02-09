# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
RUN npm install glob rimraf
RUN npm install --only=development

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=${DATABASE_USER}
ENV POSTGRES_PASSWORD=${DATABASE_PASSWORD}
ENV POSTGRES_DB=${DATABASE_NAME}

# Copy source code and build
COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy only package.json and install production dependencies
COPY package*.json ./
RUN npm install --only=production
RUN npm prune --production

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=${DATABASE_USER}
ENV POSTGRES_PASSWORD=${DATABASE_PASSWORD}
ENV POSTGRES_DB=${DATABASE_NAME}

# Copy only the necessary built files
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
