from PIL import Image, ImageFilter
import os

SRC = "/app/frontend/public/assets/committee_banner.png"
OUT = "/app/frontend/public/assets/committee"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size  # 891 x 464

FIRST_CENTER = 98.0
PITCH = 117.0
HALF = 57

# Generous vertical bands that keep the FULL portrait (head + shoulders), trimmed just above the Telugu label text
rows = [
    (10, 132),   # row 1
    (175, 287),  # row 2
    (345, 418),  # row 3
]
row_cols = [7, 7, 3]

boxes = []
for r, (top, bottom) in enumerate(rows):
    for c in range(row_cols[r]):
        cx = FIRST_CENTER + c * PITCH
        left = int(max(0, cx - HALF))
        right = int(min(W, cx + HALF))
        boxes.append((left, top, right, bottom))

crops = []
for i, (l, t, rt, b) in enumerate(boxes, start=1):
    crop = img.crop((l, t, rt, b))
    nw, nh = crop.size
    # Conservative upscale to 800px wide (keeps natural aspect ratio), once, from the original source
    scale = 800 / nw
    up = crop.resize((800, int(round(nh * scale))), Image.LANCZOS)
    up = up.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    up.save(os.path.join(OUT, f"member_{i}.jpg"), "JPEG", quality=93, subsampling=0, optimize=True)
    crops.append(up)
    print(f"member_{i}.jpg", up.size)

# contact sheet
cols = 6
rows_m = (len(crops) + cols - 1) // cols
cw, ch = 210, 250
sheet = Image.new("RGB", (cols * cw, rows_m * ch), (30, 30, 30))
for i, crop in enumerate(crops):
    thumb = crop.copy()
    thumb.thumbnail((cw - 8, ch - 8))
    sheet.paste(thumb, ((i % cols) * cw + 4, (i // cols) * ch + 4))
sheet.save("/app/scripts/committee_montage.jpg", "JPEG", quality=88)
print("total", len(crops))
