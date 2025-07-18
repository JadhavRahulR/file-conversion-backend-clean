import sys
import os
from PIL import Image
import shutil
import subprocess

if len(sys.argv) < 5:
    print("Usage: python compress_bmp.py input.bmp output_folder quality format [export7z]")
    sys.exit(1)

input_path = sys.argv[1]
output_folder = sys.argv[2]
quality = int(sys.argv[3])
out_format = sys.argv[4].lower()
export7z = sys.argv[5].lower() == 'true' if len(sys.argv) > 5 else False

# ✅ Map jpg → JPEG for PIL compatibility
format_map = {
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'webp': 'WEBP',
    'bmp': 'BMP'
}
pil_format = format_map.get(out_format, 'JPEG')

os.makedirs(output_folder, exist_ok=True)
base_name = os.path.splitext(os.path.basename(input_path))[0]
output_path = os.path.join(output_folder, f"{base_name}_compressed.{out_format}")

# Convert and save in desired format
img = Image.open(input_path).convert("RGB")
img.save(output_path, format=pil_format, quality=quality, optimize=True)

# Optional .7z export
if export7z:
    zip_path = output_path + ".7z"
    try:
        subprocess.run(["7z", "a", zip_path, output_path], check=True)
        print(f"7z archive created: {zip_path}")
    except Exception as e:
        print("Error creating 7z archive:", e)

print(f"BMP compression complete: {output_path}")
