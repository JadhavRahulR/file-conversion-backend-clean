# from pdf2docx import Converter
# import sys

# pdf_file = sys.argv[1]
# docx_file = sys.argv[2]

# cv = Converter(pdf_file)
# cv.convert(docx_file, start=0, end=None)
# cv.close()

from pdf2docx import Converter
import sys
import os
import time

if len(sys.argv) != 3:
    print(" Usage: python convert_pdf.py input.pdf output_dir")
    sys.exit(1)

pdf_path = sys.argv[1]
output_dir = sys.argv[2]

# Ensure output dir exists
os.makedirs(output_dir, exist_ok=True)

file_name = os.path.splitext(os.path.basename(pdf_path))[0]
docx_path = os.path.join(output_dir, file_name + '.docx')

try:
    print(f"Converting {pdf_path} to {docx_path}...")
    start = time.time()

    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()

    duration = time.time() - start
    print(f"Conversion completed in {duration:.2f} seconds")

except Exception as e:
    print(f" Error during conversion: {e}")
    sys.exit(1)
