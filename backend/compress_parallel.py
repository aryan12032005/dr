import os
import sys
import shutil
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

import fitz  # pymupdf

BASE_DIR = r"c:\Users\aryan\OneDrive\Desktop\dr\digitalRepo\backend\FILES"
BACKUP_DIR = r"c:\Users\aryan\OneDrive\Desktop\dr\digitalRepo\backend\FILES_BACKUP_ORIGINALS"
MAX_SIZE = 10 * 1024 * 1024  # 10 MB = 10,485,760 bytes
TARGET_SIZE = 9_400_000       # 9.4 MB for safe margin under Cloudinary free limit

PROFILES = [
    {"dpi": 130, "quality": 65},
    {"dpi": 100, "quality": 50},
    {"dpi": 80,  "quality": 38},
    {"dpi": 60,  "quality": 28},
    {"dpi": 45,  "quality": 20},
    {"dpi": 32,  "quality": 14},
]

def pick_start_profile(size_bytes):
    mb = size_bytes / (1024 * 1024)
    if mb > 50:
        return 3 # 60dpi
    elif mb > 25:
        return 2 # 80dpi
    elif mb > 15:
        return 1 # 100dpi
    else:
        return 0 # 130dpi

def compress_single_pdf(filepath):
    """Worker function to compress one PDF file."""
    try:
        orig_sz = os.path.getsize(filepath)
        if orig_sz <= MAX_SIZE:
            return filepath, orig_sz, orig_sz, "already_under", True

        rel_path = os.path.relpath(filepath, BASE_DIR)
        backup_path = os.path.join(BACKUP_DIR, rel_path)
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        if not os.path.exists(backup_path):
            shutil.copy2(filepath, backup_path)

        start_idx = pick_start_profile(orig_sz)
        temp_path = filepath + f".par_{os.getpid()}.tmp"

        for idx in range(start_idx, len(PROFILES)):
            prof = PROFILES[idx]
            dpi = prof["dpi"]
            quality = prof["quality"]

            doc = fitz.open(filepath)
            new_doc = fitz.open()

            for page_num in range(len(doc)):
                page = doc[page_num]
                mat = fitz.Matrix(dpi / 72.0, dpi / 72.0)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img_bytes = pix.tobytes("jpeg", quality)

                rect = page.rect
                new_page = new_doc.new_page(width=rect.width, height=rect.height)
                new_page.insert_image(rect, stream=img_bytes)

            new_doc.save(temp_path, garbage=4, deflate=True, clean=True)
            new_doc.close()
            doc.close()

            new_sz = os.path.getsize(temp_path)
            if new_sz <= TARGET_SIZE:
                os.replace(temp_path, filepath)
                return filepath, orig_sz, new_sz, f"{dpi}dpi_q{quality}", True
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        # If even lowest profile didn't reach target, save lowest
        return filepath, orig_sz, orig_sz, "failed_target", False

    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
        return filepath, 0, 0, f"error: {str(e)[:50]}", False

def sync_twin_files():
    """Copy already-compressed files between cover and document if identical."""
    copied = 0
    for root, dirs, files in os.walk(BASE_DIR):
        if root.endswith("cover"):
            doc_dir = os.path.join(os.path.dirname(root), "document")
            if os.path.exists(doc_dir):
                for f in files:
                    cf = os.path.join(root, f)
                    df = os.path.join(doc_dir, f)
                    if os.path.exists(df):
                        csz = os.path.getsize(cf)
                        dsz = os.path.getsize(df)
                        if csz <= TARGET_SIZE and dsz > MAX_SIZE:
                            shutil.copy2(cf, df)
                            copied += 1
                        elif dsz <= TARGET_SIZE and csz > MAX_SIZE:
                            shutil.copy2(df, cf)
                            copied += 1
    return copied

def main():
    print("=" * 60)
    print("PARALLEL PDF COMPRESSION (6 CORES)")
    print("=" * 60)

    # 1. Quick sync of any already-compressed twins
    synced = sync_twin_files()
    if synced > 0:
        print(f"Instantly synced {synced} twin files that were already compressed!")

    # 2. Collect unique oversized files
    oversized = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            fp = os.path.join(root, f)
            sz = os.path.getsize(fp)
            if sz > MAX_SIZE and f.lower().endswith('.pdf'):
                oversized.append(fp)

    print(f"Total PDFs remaining > 10MB: {len(oversized)}")
    if not oversized:
        print("All PDFs are already under 10MB!")
        return

    # Deduplicate: if both cover and document have the exact same file, only compress one!
    to_compress = []
    twins = {} # src -> dst
    for fp in oversized:
        if "\\cover\\" in fp:
            twin = fp.replace("\\cover\\", "\\document\\")
            if twin in oversized:
                twins[fp] = twin
        to_compress.append(fp)

    # Filter out the twin destination from the active compress list
    actual_jobs = [fp for fp in to_compress if fp not in twins.values()]
    print(f"Unique PDFs to process (deduplicated): {len(actual_jobs)}")
    print(f"Twin files will be automatically copied after compression: {len(twins)}")

    # Sort largest first so heaviest work starts immediately on 6 cores
    actual_jobs.sort(key=lambda x: os.path.getsize(x), reverse=True)

    start_time = time.time()
    completed = 0
    total = len(actual_jobs)

    with ProcessPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(compress_single_pdf, fp): fp for fp in actual_jobs}

        for future in as_completed(futures):
            fp = futures[future]
            completed += 1
            path, orig_sz, new_sz, status, success = future.result()
            rel = os.path.relpath(path, BASE_DIR)
            orig_mb = orig_sz / (1024 * 1024)
            new_mb = new_sz / (1024 * 1024)

            print(f"[{completed}/{total}] {rel}: {orig_mb:.1f}MB -> {new_mb:.1f}MB ({status})")

            # If this had a twin, copy it over!
            if path in twins and success:
                twin_path = twins[path]
                shutil.copy2(path, twin_path)
                print(f"   -> Copied to twin: {os.path.relpath(twin_path, BASE_DIR)}")

    # Final sync check
    sync_twin_files()

    # Verify how many are still > 10MB
    remaining = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            fp = os.path.join(root, f)
            sz = os.path.getsize(fp)
            if sz > MAX_SIZE:
                remaining.append((fp, sz))

    elapsed = time.time() - start_time
    print("=" * 60)
    print(f"Finished in {elapsed/60:.1f} minutes!")
    print(f"Files still > 10MB: {len(remaining)}")
    for fp, sz in remaining:
        print(f"  {os.path.relpath(fp, BASE_DIR)}: {sz/(1024*1024):.1f}MB")

if __name__ == "__main__":
    main()
