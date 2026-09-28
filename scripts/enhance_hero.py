from PIL import Image, ImageFilter
import os

A = "/app/frontend/public/assets"

def enhance(src, dst, scale, fmt="PNG", quality=94):
    im = Image.open(src).convert("RGB")
    up = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
    up = up.filter(ImageFilter.UnsharpMask(radius=1.0, percent=60, threshold=2))
    if fmt == "JPEG":
        up.save(dst, "JPEG", quality=quality, subsampling=0, optimize=True)
    else:
        up.save(dst, "PNG", optimize=True)
    print(dst, up.size)

# Original assets are the highest-resolution available; upscale once for crisp display on high-DPI screens.
enhance(f"{A}/deity.png", f"{A}/deity_hd.jpg", 2, fmt="JPEG", quality=94)
enhance(f"{A}/title_artwork.png", f"{A}/title_artwork_hd.png", 3, fmt="PNG")
