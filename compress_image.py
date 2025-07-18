# compress_image.py
import sys
from PIL import Image
import os

def compress_image(input_path, output_path, quality):
    img = Image.open(input_path)

    # Convert if PNG with transparency
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    img.save(output_path, "JPEG", optimize=True, quality=quality)

if __name__ == "__main__":
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 70

    if not os.path.exists(input_path):
        print("Input file not found.")
        sys.exit(1)

    compress_image(input_path, output_path, quality)
