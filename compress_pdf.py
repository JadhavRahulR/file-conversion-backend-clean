# compress_pdf.py
import fitz
import sys
import os
from PIL import Image
from io import BytesIO
# import sys
sys.stdout.reconfigure(encoding='utf-8')


def compress_pdf(input_path, output_path, quality=70):
    print(f"Compressing: {input_path}")
    print(f"Saving to: {output_path}")
    print(f"Quality: {quality}")
    doc = fitz.open(input_path)
    for page in doc:
        images = page.get_images(full=True)
        for img in images:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image = Image.open(BytesIO(image_bytes))
            if image.mode == "RGBA":
                image = image.convert("RGB")
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=quality)
            # doc.update_image(xref, buffer.getvalue())
            doc.update_stream(xref, buffer.getvalue())

    doc.save(output_path, garbage=4, deflate=True)
    print("✅ Compression complete.")

if __name__ == "__main__":
    input_pdf = sys.argv[1]
    output_pdf = sys.argv[2]
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 70
    quality = max(30, min(95, quality))
    print("⚙️ Script started...")

    if not os.path.exists(input_pdf):
        print("Input file not found.")
        sys.exit(1)

    compress_pdf(input_pdf, output_pdf, quality)
    
