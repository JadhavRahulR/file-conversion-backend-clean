import sys
from pdf2docx import Converter
import os

def convert(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    filename = os.path.basename(pdf_path)
    name_without_ext = os.path.splitext(filename)[0]
    docx_path = os.path.join(output_dir, f"{name_without_ext}.docx")

    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cv.close()
    
    print(docx_path)

if __name__ == "__main__":
    pdf_file = sys.argv[1]
    output_dir = sys.argv[2]
    convert(pdf_file, output_dir)
