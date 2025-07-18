import os
import sys
import zipfile
import shutil
from PIL import Image

def compress_images_in_odp(extracted_path, quality):
    pictures_dir = os.path.join(extracted_path, "Pictures")
    if not os.path.isdir(pictures_dir):
        print(" No images found to compress.")
        return

    for filename in os.listdir(pictures_dir):
        file_path = os.path.join(pictures_dir, filename)

        try:
            with Image.open(file_path) as img:
                if img.format in ["JPEG", "JPG", "PNG"]:
                    img = img.convert("RGB")
                    img.save(file_path, format="JPEG", quality=int(quality))
                    print(f"🗜️ Compressed {filename}")
        except Exception as e:
            print(f" Skipped {filename}: {e}")

def compress_odp(input_path, output_folder, quality, output_type):
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_file = os.path.join(output_folder, f"{base_name}_compressed.odp")
    temp_extract = os.path.join(output_folder, f"{base_name}_temp")

    os.makedirs(temp_extract, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)

    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract)

    compress_images_in_odp(temp_extract, quality)

    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as odp_zip:
        for root, _, files in os.walk(temp_extract):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, temp_extract)
                odp_zip.write(full_path, rel_path)

    if output_type == "7z":
        compressed_7z_path = output_file + ".7z"
        shutil.make_archive(output_file, 'zip', output_folder, os.path.basename(output_file))
        os.rename(output_file + ".zip", compressed_7z_path)
        print(f".odp.7z created: {compressed_7z_path}")
    else:
        print(f" ODP compression complete: {output_file}")

    shutil.rmtree(temp_extract)

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(" Usage: python compress_odp_user.py input.odp output_folder quality output_type")
        sys.exit(1)

    input_file = sys.argv[1]
    output_folder = sys.argv[2]
    quality = sys.argv[3]
    output_type = sys.argv[4]

    compress_odp(input_file, output_folder, quality, output_type)
