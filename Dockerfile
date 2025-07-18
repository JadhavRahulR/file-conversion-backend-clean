# Use official Node image as base
FROM node:18-slim

# Install LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (matches your app.listen(port))
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
