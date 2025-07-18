import sys
from PyPDF2 import PdfMerger

def merge_pdfs(input_paths, output_path):
    merger = PdfMerger()
    for pdf in input_paths:
        merger.append(pdf)
    merger.write(output_path)
    merger.close()

if __name__ == "__main__":
    # PDFs passed as CLI args: python merge_pdfs.py output.pdf input1.pdf input2.pdf ...
    output = sys.argv[1]
    inputs = sys.argv[2:]
    merge_pdfs(inputs, output)
