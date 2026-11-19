"""
Compress all PDF files in the FILES directory that exceed 10MB.
Uses pymupdf (fitz) to reduce image quality and resolution.
Target: get every file under 10,485,760 bytes (10 MB).
"""

import os
import sys
import shutil
import time

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

import fitz  # pymupdf

BASE_DIR = r"c:\Users\aryan\OneDrive\Desktop\dr\digitalRepo\backend\FILES"
BACKUP_DIR = r"c:\Users\aryan\OneDrive\Desktop\dr\digitalRepo\backend\FILES_BACKUP_ORIGINALS"
MAX_SIZE = 10 * 1024 * 1024  # 10 MB
TARGET_SIZE = int(9.8 * 1024 * 1024)  # ~9.8 MB target with margin

# Compression profiles - increasingly aggressive
PROFILES = [
    {"dpi": 150, "quality": 70},
    {"dpi": 120, "quality": 55},
    {"dpi": 100, "quality": 45},
    {"dpi": 80,  "quality": 35},
    {"dpi": 60,  "quality": 25},
    {"dpi": 50,  "quality": 20},
    {"dpi": 40,  "quality": 15},
]

def estimate_profile(original_size):
    """Pick a starting profile based on how large the file is."""
    ratio = original_size / TARGET_SIZE
    if ratio > 8:
        return 4  # start at 60dpi for very large files
    elif ratio > 5:
        return 3  # 80dpi
    elif ratio > 3:
        return 2  # 100dpi
    elif ratio > 2:
        return 1  # 120dpi
    else:
        return 0  # 150dpi

def compress_pdf(input_path, output_path, original_size):
    """Compress a PDF by re-rendering pages as JPEG images at reduced DPI."""
    start_idx = estimate_profile(original_size)
    
    for i in range(start_idx, len(PROFILES)):
        profile = PROFILES[i]
        dpi = profile["dpi"]
        quality = profile["quality"]
        
        try:
            doc = fitz.open(input_path)
            new_doc = fitz.open()
            
            num_pages = len(doc)
            for page_num in range(num_pages):
                page = doc[page_num]
                # Render page to pixmap at reduced DPI
                mat = fitz.Matrix(dpi / 72.0, dpi / 72.0)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img_bytes = pix.tobytes("jpeg", quality)
                
                # Create new page with same dimensions and insert compressed image
                rect = page.rect
                new_page = new_doc.new_page(width=rect.width, height=rect.height)
                new_page.insert_image(rect, stream=img_bytes)
                
                # Progress for large docs
                if num_pages > 50 and (page_num + 1) % 50 == 0:
                    print(f"    page {page_num + 1}/{num_pages}...")
            
            new_doc.save(output_path, garbage=4, deflate=True, clean=True)
            new_doc.close()
            doc.close()
            
            result_size = os.path.getsize(output_path)
            
            if result_size <= TARGET_SIZE:
                return result_size, f"{dpi}dpi/q{quality}"
            else:
                print(f"    {dpi}dpi/q{quality} -> {result_size/(1024*1024):.1f}MB (still over, trying harder...)")
                # Remove temp and try next profile
                if os.path.exists(output_path):
                    os.remove(output_path)
                continue
                
        except Exception as e:
            try: doc.close()
            except: pass
            try: new_doc.close()
            except: pass
            raise e
    
    # Return whatever we managed
    return -1, "failed"

def main():
    print("=" * 60)
    print("PDF COMPRESSION SCRIPT")
    print("=" * 60)
    
    # Collect all oversized PDFs
    large_files = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            fp = os.path.join(root, f)
            sz = os.path.getsize(fp)
            if sz > MAX_SIZE and f.lower().endswith('.pdf'):
                large_files.append((fp, sz))
    
    # Sort smallest first (faster wins first)
    large_files.sort(key=lambda x: x[1])
    
    print(f"PDFs > 10MB to compress: {len(large_files)}")
    
    if not large_files:
        print("Nothing to do!")
        return
    
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    success = 0
    failed = 0
    total_saved = 0
    start_time = time.time()
    
    for idx, (filepath, original_size) in enumerate(large_files, 1):
        rel_path = os.path.relpath(filepath, BASE_DIR)
        size_mb = original_size / (1024 * 1024)
        
        print(f"\n[{idx}/{len(large_files)}] {rel_path} ({size_mb:.1f}MB)")
        
        # Backup original
        backup_path = os.path.join(BACKUP_DIR, rel_path)
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        if not os.path.exists(backup_path):
            shutil.copy2(filepath, backup_path)
        
        # Compress
        temp_path = filepath + ".tmp"
        try:
            t0 = time.time()
            result_size, profile = compress_pdf(filepath, temp_path, original_size)
            elapsed = time.time() - t0
            
            if result_size > 0 and result_size <= TARGET_SIZE:
                os.replace(temp_path, filepath)
                saved = original_size - result_size
                total_saved += saved
                success += 1
                print(f"  OK: {result_size/(1024*1024):.1f}MB [{profile}] saved {saved/(1024*1024):.1f}MB ({elapsed:.0f}s)")
            else:
                failed += 1
                # Keep compressed version if smaller even though over limit
                if os.path.exists(temp_path):
                    ts = os.path.getsize(temp_path)
                    if ts < original_size:
                        os.replace(temp_path, filepath)
                        saved = original_size - ts
                        total_saved += saved
                        print(f"  PARTIAL: {ts/(1024*1024):.1f}MB (still over 10MB) ({elapsed:.0f}s)")
                    else:
                        os.remove(temp_path)
                        print(f"  FAILED: could not compress ({elapsed:.0f}s)")
                        
        except Exception as e:
            failed += 1
            print(f"  ERROR: {e}")
            if os.path.exists(temp_path):
                try: os.remove(temp_path)
                except: pass
    
    total_time = time.time() - start_time
    print(f"\n{'=' * 60}")
    print(f"DONE in {total_time/60:.1f} minutes")
    print(f"Success: {success}/{len(large_files)}")
    print(f"Failed: {failed}")
    print(f"Total saved: {total_saved/(1024*1024):.0f} MB")
    
    # Final check
    still_over = []
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            fp = os.path.join(root, f)
            sz = os.path.getsize(fp)
            if sz > MAX_SIZE:
                still_over.append((fp, sz))
    
    print(f"Files still over 10MB: {len(still_over)}")
    for fp, sz in still_over:
        print(f"  {os.path.relpath(fp, BASE_DIR)}: {sz/(1024*1024):.1f}MB")

if __name__ == "__main__":
    main()
