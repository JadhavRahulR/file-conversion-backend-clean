# Use official Node.js image
FROM node:18-slim

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

# Install Python3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install Python and system packages (Poppler for pdf2image, etc.)
RUN apt-get update && \
    apt-get install -y python3 python3-pip poppler-utils && \
    apt-get clean

# Create app directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    python3-dev \
    build-essential \
    poppler-utils \
    libglib2.0-0 \
    libgl1-mesa-glx && \
    apt-get clean

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Print and debug Python version
RUN python3 --version && pip3 --version

# Try installing Python packages and keep the logs
RUN pip3 install --no-cache-dir -r requirements.txt || cat requirements.txt

RUN pip install --no-cache-dir pdf2docx pillow pypdf2 py7zr pymupdf odfpy zstandard

# Set environment variable for port (used by Render)
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
