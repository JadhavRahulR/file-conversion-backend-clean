import sys
import os
from PIL import Image
import shutil
import subprocess

if len(sys.argv) < 4:
    print(" Usage: python compress_tiff.py input.tiff output_folder quality [export7z]")
    sys.exit(1)

input_path = sys.argv[1]
output_folder = sys.argv[2]
quality = int(sys.argv[3])
export7z = sys.argv[4].lower() == "true" if len(sys.argv) > 4 else False

os.makedirs(output_folder, exist_ok=True)

# Prepare output file path
base_name = os.path.splitext(os.path.basename(input_path))[0]
output_path = os.path.join(output_folder, f"{base_name}_compressed.tiff")

# Open and compress TIFF
try:
    with Image.open(input_path) as img:
        img.save(output_path, format='TIFF', compression='tiff_jpeg', quality=quality)
    print(f" TIFF compression complete: {output_path}")
except Exception as e:
    print(f" Error during compression: {e}")
    sys.exit(1)

# Optional 7z export
if export7z:
    archive_path = output_path + ".7z"
    try:
        subprocess.run(["7z", "a", archive_path, output_path], check=True)
        print(f" 7z archive created: {archive_path}")
    except Exception as e:
        print(f" Error creating 7z archive: {e}")
