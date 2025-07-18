import os
import sys
import zipfile
import shutil
from PIL import Image
from odf.opendocument import load
from odf import text

def compress_images_in_odt(extracted_path, quality):
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

def clean_text_content(odt_path):
    from odf.opendocument import load
    from odf import text

    doc = load(odt_path)
    paragraphs = doc.getElementsByType(text.P)

    removed = 0

    for p in list(paragraphs):
        has_visible_content = False

        for node in p.childNodes:
            if hasattr(node, 'data') and node.data and node.data.strip():
                has_visible_content = True
                break
            elif node.nodeType == node.ELEMENT_NODE:
                has_visible_content = True
                break

        if not has_visible_content:
            p.parentNode.removeChild(p)
            removed += 1

    print(f" Removed {removed} truly empty paragraphs")
    doc.save(odt_path)

def compress_odt(input_path, output_folder, quality, output_type):
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_file = os.path.join(output_folder, f"{base_name}_compressed.odt")
    temp_extract = os.path.join(output_folder, f"{base_name}_temp")

    os.makedirs(temp_extract, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)

    # Extract ODT zip
    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        zip_ref.extractall(temp_extract)

    # Step 1: Compress images
    compress_images_in_odt(temp_extract, quality)

    # Step 2: Repack into compressed .odt
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as odt_zip:
        for root, _, files in os.walk(temp_extract):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, temp_extract)
                odt_zip.write(full_path, rel_path)

    # Step 3: Clean text (remove blank paragraphs only)
    clean_text_content(output_file)

    # Step 4: Optional .7z export
    if output_type == "7z":
        compressed_7z_path = output_file + ".7z"
        shutil.make_archive(output_file, 'zip', output_folder, os.path.basename(output_file))
        os.rename(output_file + ".zip", compressed_7z_path)
        print(f" .odt.7z created: {compressed_7z_path}")
    else:
        print(f" ODT compression complete: {output_file}")

    # Step 5: Cleanup temp
    shutil.rmtree(temp_extract)

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(" Usage: python compress_odt_user.py input.odt output_folder quality output_type")
        sys.exit(1)

    input_file = sys.argv[1]
    output_folder = sys.argv[2]
    quality = sys.argv[3]
    output_type = sys.argv[4]

    compress_odt(input_file, output_folder, quality, output_type)
