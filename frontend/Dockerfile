# Stage 1: Build the React App
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .

# Add runtime environment variable script
COPY ./run.sh /usr/share/nginx/html/run.sh
RUN chmod +x /usr/share/nginx/html/run.sh

RUN ls -l /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Use run script for dynamic environment variables
CMD ["sh", "/usr/share/nginx/html/run.sh"]
