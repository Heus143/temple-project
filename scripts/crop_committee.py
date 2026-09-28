from PIL import Image, ImageFilter, ImageOps
import os

SRC = "/app/frontend/public/assets/committee_banner.png"
OUT = "/app/frontend/public/assets/committee"
os.makedirs(OUT, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size  # 891 x 464

# Column geometry (tuned to avoid neighbouring faces; portraits are ~104px wide)
first_center = 98.0
pitch = 117.0
half = 50  # tighter horizontal half-width so no neighbour creeps in

# Row vertical bands (photo area only, labels excluded)
rows = [
    (10, 132),   # row 1  -> members 1-7
    (176, 286),  # row 2  -> members 8-14
    (346, 416),  # row 3  -> members 15-17
]
row_cols = [7, 7, 3]

def crop_member(col, top, bot):
    cx = first_center + col * pitch
    left = max(0, int(round(cx - half)))
    right = min(W, int(round(cx + half)))
    box = (left, top, right, bot)
    c = img.crop(box)
    # Conservative 2x upscale (do not over-enlarge low-res source), mild sharpen only
    c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS)
    c = c.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    return c

crops = []
n = 0
for (top, bot), cols in zip(rows, row_cols):
    for col in range(cols):
        n += 1
        c = crop_member(col, top, bot)
        path = f"{OUT}/member_{n}.jpg"
        c.save(path, "JPEG", quality=92, optimize=True)
        crops.append((n, c))
        print(f"member_{n}.jpg", c.size)

# Contact sheet to verify
cols = 6
rows_m = (len(crops) + cols - 1) // cols
cw, ch = 190, 240
sheet = Image.new("RGB", (cols * cw, rows_m * ch), (255, 250, 240))
for idx, (num, c) in enumerate(crops):
    t = c.copy()
    t.thumbnail((cw - 8, ch - 8))
    x = (idx % cols) * cw + 4
    y = (idx // cols) * ch + 4
    sheet.paste(t, (x, y))
sheet.save("/app/scripts/committee_montage.jpg", "JPEG", quality=90)
print("total", len(crops))
