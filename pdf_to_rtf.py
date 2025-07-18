import sys
import os
from pdf2docx import Converter
import subprocess

def convert_pdf_to_docx(pdf_path, docx_path):
    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cv.close()

def convert_docx_to_rtf(docx_path, output_dir):
    try:
        subprocess.run([
            "soffice",
            "--headless",
            "--convert-to", "rtf",
            "--outdir", output_dir,
            docx_path
        ], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print("RTF conversion failed:", e)
        return False

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(" PDF file not found.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    temp_docx = os.path.join(output_dir, base_name + ".docx")

    print(" Converting PDF to DOCX...")
    convert_pdf_to_docx(pdf_path, temp_docx)

    print(" Converting DOCX to RTF...")
    success = convert_docx_to_rtf(temp_docx, output_dir)

    if success:
        print("RTF conversion successful")
        os.remove(temp_docx)  # clean up
    else:
        print(" RTF conversion failed")
        sys.exit(1)
