# Use Node.js base with Python support
FROM node:18-slim

# Install system-level dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
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
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create pip and python symlinks if not already present
RUN ln -sf /usr/bin/python3 /usr/bin/python && ln -sf /usr/bin/pip3 /usr/bin/pip

# Set working directory
WORKDIR /app

# Copy and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Install Python packages
COPY requirements.txt ./
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Also install extra Python packages directly if needed
RUN pip install --no-cache-dir pdf2docx pillow pypdf2 py7zr pymupdf odfpy zstandard

# Set environment port for Render
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start Node server
CMD ["node", "server.js"]
