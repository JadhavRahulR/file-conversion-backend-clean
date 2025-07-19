# Use official Node.js image
FROM node:18-slim

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

# Install Python3 and pip
# Install required system and Python dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    poppler-utils \
    tesseract-ocr \
    build-essential \
    libpoppler-cpp-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libopenjp2-7 \
    libtiff-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    libpq-dev \
    libgl1-mesa-glx \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Symlink python for compatibility
RUN ln -s /usr/bin/python3 /usr/bin/python && ln -s /usr/bin/pip3 /usr/bin/pip

# Create app directory
WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install packages
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir pdf2docx pillow pypdf2 py7zr pymupdf odfpy zstandard

# Copy the rest of the app
COPY . .

# Set environment variable for port (used by Render)
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the Node.js server
CMD ["node", "server.js"]