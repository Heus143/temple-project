from PIL import Image
import os

SRC = "/app/frontend/public/assets/committee_banner.png"
OUT = "/app/frontend/public/assets/committee"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size  # 891 x 464

FIRST_CENTER = 98.0
PITCH = 117.0
HALF = 55

rows = [
    (12, 132),   # row 1
    (176, 292),  # row 2
    (346, 424),  # row 3
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
    scale = 3.4
    crop = crop.resize((int(nw * scale), int(nh * scale)), Image.LANCZOS)
    crop.save(os.path.join(OUT, f"member_{i}.jpg"), "JPEG", quality=90)
    crops.append(crop)

cols = 6
rows_m = (len(crops) + cols - 1) // cols
cw, ch = 200, 250
sheet = Image.new("RGB", (cols * cw, rows_m * ch), (30, 30, 30))
for i, crop in enumerate(crops):
    thumb = crop.copy()
    thumb.thumbnail((cw - 8, ch - 8))
    x = (i % cols) * cw + 4
    y = (i // cols) * ch + 4
    sheet.paste(thumb, (x, y))
sheet.save("/app/scripts/committee_montage.jpg", "JPEG", quality=85)
print("total", len(crops))
