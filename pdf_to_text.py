import fitz  # PyMuPDF
import sys
import os

def pdf_to_text(pdf_path, output_dir):
    print(" Entered pdf_to_text()")
    print(" PDF path:", pdf_path)
    print(" Output dir:", output_dir)

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(" Failed to open PDF:", e)
        return

    text = ""
    for page in doc:
        text += page.get_text()

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    base = os.path.splitext(os.path.basename(pdf_path))[0]
    output_file = os.path.join(output_dir, f"{base}.txt")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)

    print("Text written to:", output_file)
    return output_file

if __name__ == "__main__":
    print("Script started with", len(sys.argv), "arguments")
    if len(sys.argv) != 3:
        print("Usage error. Expecting 2 arguments: <input.pdf> <output_folder>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    pdf_to_text(pdf_path, output_dir)
