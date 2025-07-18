import zipfile
import os
import shutil
import sys
from PIL import Image
import py7zr

if len(sys.argv) < 5:
    print(" Usage: python compress_docx_user_config.py input.docx output_folder quality output_type")
    print("output_type = docx or 7z")
    sys.exit(1)

input_docx = sys.argv[1]
output_folder = sys.argv[2]
quality = int(sys.argv[3])
output_type = sys.argv[4]

os.makedirs(output_folder, exist_ok=True)
temp_dir = os.path.join(output_folder, "temp_docx")
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(temp_dir)

# Step 1: Unzip DOCX
with zipfile.ZipFile(input_docx, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

# Step 2: Compress images in /word/media
media_path = os.path.join(temp_dir, "word", "media")
if os.path.exists(media_path):
    for file in os.listdir(media_path):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            full_path = os.path.join(media_path, file)
            try:
                img = Image.open(full_path)
                if img.width > 1280:
                    new_width = 1280
                    new_height = int(img.height * (1280 / img.width))
                    img = img.resize((new_width, new_height), Image.LANCZOS)
                img.save(full_path, optimize=True, quality=quality)
            except Exception as e:
                print(f"Could not compress {file}: {e}")

# Step 3: Repack as .docx
output_docx = os.path.join(output_folder, os.path.basename(input_docx).replace('.docx', '_compressed.docx'))
shutil.make_archive(output_docx.replace('.docx', ''), 'zip', temp_dir)
shutil.move(output_docx.replace('.docx', '') + '.zip', output_docx)

# Step 4: Optionally zip to .7z
if output_type == '7z':
    output_7z = output_docx + '.7z'
    with py7zr.SevenZipFile(output_7z, 'w') as archive:
        archive.write(output_docx, arcname=os.path.basename(output_docx))
    os.remove(output_docx)
    print(f"Final output: {output_7z}")
else:
    print(f" Final output: {output_docx}")

shutil.rmtree(temp_dir)
