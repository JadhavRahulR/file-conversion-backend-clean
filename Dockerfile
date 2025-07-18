# Use official Node.js image
FROM node:18-slim

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

# Install Python3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip
# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Set environment variable for port (used by Render)
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
