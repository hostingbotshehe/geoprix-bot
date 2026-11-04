"""Render the rules images:
- assets/rules-banner.png: green logo | "Rules" | red logo on a green->red gradient
- assets/rules-divider.png: a long, thin strip of just the gradient (posted after the rules)

Usage: python tools/make_banner.py   (needs Pillow and Hokjesgeest.otf in the project root)
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 400
LOGO = 300
PAD = 50
RADIUS = 48
GREEN = (24, 150, 115)   # matches the green logo's background
RED = (219, 13, 36)      # matches the red logo's background
TEXT = "Rules"


def gradient(w=W, h=H):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for x in range(w):
        t = x / (w - 1)
        t = t * t * (3 - 2 * t)  # smoothstep for a softer blend in the middle
        c = tuple(round(GREEN[i] + (RED[i] - GREEN[i]) * t) for i in range(3))
        for y in range(h):
            px[x, y] = c
    # subtle vertical shading for depth
    shade = Image.linear_gradient("L").resize((w, h)).point(lambda v: v * 0.35)
    return Image.composite(Image.new("RGB", (w, h), (0, 0, 0)), img, shade)


def divider():
    # Same width as the banner so both line up in Discord, but only 1/10 of the height.
    gradient(W, 40).save("assets/rules-divider.png", optimize=True)
    print("saved assets/rules-divider.png", (W, 40))


def rounded(path):
    logo = Image.open(path).convert("RGB").resize((LOGO, LOGO), Image.LANCZOS)
    mask = Image.new("L", (LOGO, LOGO), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, LOGO - 1, LOGO - 1), RADIUS, fill=255)
    out = Image.new("RGBA", (LOGO, LOGO))
    out.paste(logo, (0, 0), mask)
    return out


def shadow(size, box, blur, alpha):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, RADIUS, fill=(0, 0, 0, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def main():
    canvas = gradient().convert("RGBA")
    y = (H - LOGO) // 2
    for path, x in (("assets/source/logo-green.jpg", PAD), ("assets/source/logo-red.jpg", W - PAD - LOGO)):
        canvas = Image.alpha_composite(canvas, shadow(canvas.size, (x + 6, y + 12, x + LOGO + 6, y + LOGO + 12), 14, 140))
        # thin white ring around each logo
        ring = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(ring).rounded_rectangle((x - 5, y - 5, x + LOGO + 4, y + LOGO + 4), RADIUS + 5, fill=(255, 255, 255, 230))
        canvas = Image.alpha_composite(canvas, ring)
        canvas.alpha_composite(rounded(path), (x, y))

    # Fit the title into the space between the logos.
    space = W - 2 * (PAD + LOGO) - 120
    size = 220
    font = ImageFont.truetype("Hokjesgeest.otf", size)
    while font.getbbox(TEXT)[2] - font.getbbox(TEXT)[0] > space:
        size -= 4
        font = ImageFont.truetype("Hokjesgeest.otf", size)
    l, t, r, b = font.getbbox(TEXT)
    tx = (W - (r - l)) // 2 - l
    ty = (H - (b - t)) // 2 - t

    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).text((tx + 6, ty + 10), TEXT, font=font, fill=(0, 0, 0, 170))
    canvas = Image.alpha_composite(canvas, glow.filter(ImageFilter.GaussianBlur(10)))
    d = ImageDraw.Draw(canvas)
    d.text((tx, ty), TEXT, font=font, fill="white", stroke_width=4, stroke_fill=(15, 15, 20))

    canvas.convert("RGB").save("assets/rules-banner.png", optimize=True)
    print("saved assets/rules-banner.png", canvas.size, "font size", size)


if __name__ == "__main__":
    main()
    divider()
