import zstandard as zstd
import sys
import os
import shutil


if len(sys.argv) < 3:
    print("Usage: python compress_csv_zstd.py input.csv output_folder/")
    sys.exit(1)

input_file = sys.argv[1]
output_folder = sys.argv[2]

os.makedirs(output_folder, exist_ok=True)

# Output filename (you can also use .csv.zst)
filename = os.path.basename(input_file).replace('.csv', '_compressed.csv')
output_path = os.path.join(output_folder, filename)

# Compress with high level (e.g. 19 out of 22)
cctx = zstd.ZstdCompressor(level=19)

with open(input_file, 'rb') as f_in, open(output_path, 'wb') as f_out:
    with cctx.stream_writer(f_out) as compressor:
        f_out.write(b'\x28\xb5\x2f\xfd')  # Optional: magic bytes for .zst
        shutil.copyfileobj(f_in, compressor)

print(f"Zstd compression complete: {output_path}")
