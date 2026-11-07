"""Render the animated channel images:
- assets/{rules,installation,official-mods,public-mods,links}-banner.gif: green logo | title | red logo on a green->red gradient.
  The logos rush into the center, "eat" the text, merge into one, split back out, and the text pops back.
- assets/rules-divider.gif: a long, thin strip of the gradient, scrolling in a seamless loop.

Usage: python tools/make_banner.py   (needs Pillow and Hokjesgeest.otf in the project root)

Everything is drawn at 1600x400 and scaled down to OUT_W wide to keep the GIFs small enough for Discord.
"""
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 400
OUT_W = 1000              # final GIF width (height scales with it)
LOGO = 300
PAD = 50
RADIUS = 48
GREEN = (24, 150, 115)    # matches the green logo's background
RED = (219, 13, 36)       # matches the red logo's background
FPS = 25

# Banner timeline, in seconds.
IDLE = 1.2                # everything still at the start
RUSH = 0.55               # logos rush to the middle and swallow the text
MERGE = 0.7               # logos sit merged in the middle and swell once
BACK = 0.6                # logos slide back out
POP = 0.4                 # text pops back in
REST = 0.8                # everything still before looping
LOOP = IDLE + RUSH + MERGE + BACK + POP + REST


# ---------- helpers ----------

def ease_in_cubic(t):
    return t ** 3


def ease_out_cubic(t):
    return 1 - (1 - t) ** 3


def ease_in_out_cubic(t):
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def ease_out_back(t, s=1.2):
    t -= 1
    return 1 + (s + 1) * t ** 3 + s * t ** 2


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(round(lerp(c1[i], c2[i], t)) for i in range(3))


def shade(img):
    # subtle vertical shading for depth
    w, h = img.size
    mask = Image.linear_gradient("L").resize((w, h)).point(lambda v: v * 0.35)
    return Image.composite(Image.new("RGB", (w, h), (0, 0, 0)), img, mask)


def gradient(w=W, h=H):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for x in range(w):
        t = x / (w - 1)
        draw.line([(x, 0), (x, h)], fill=mix(GREEN, RED, t * t * (3 - 2 * t)))
    return shade(img)


def logo_sprite(path):
    """Logo with rounded corners, a white ring and a drop shadow, on a transparent sprite."""
    m = 30  # margin for ring + shadow
    size = LOGO + 2 * m
    sprite = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((m + 6, m + 12, m + LOGO + 6, m + LOGO + 12), RADIUS, fill=(0, 0, 0, 140))
    sprite = Image.alpha_composite(sprite, shadow.filter(ImageFilter.GaussianBlur(12)))

    ImageDraw.Draw(sprite).rounded_rectangle(
        (m - 5, m - 5, m + LOGO + 4, m + LOGO + 4), RADIUS + 5, fill=(255, 255, 255, 235)
    )
    logo = Image.open(path).convert("RGB").resize((LOGO, LOGO), Image.LANCZOS)
    mask = Image.new("L", (LOGO, LOGO), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, LOGO - 1, LOGO - 1), RADIUS, fill=255)
    sprite.paste(logo, (m, m), mask)
    return sprite, m


def text_sprite(text):
    """The title with outline and soft shadow, cropped to its own box."""
    space = W - 2 * (PAD + LOGO) - 120
    size = 220
    font = ImageFont.truetype("Hokjesgeest.otf", size)
    while font.getbbox(text)[2] - font.getbbox(text)[0] > space:
        size -= 4
        font = ImageFont.truetype("Hokjesgeest.otf", size)
    l, t, r, b = font.getbbox(text, stroke_width=4)
    m = 40
    w, h = r - l + 2 * m, b - t + 2 * m
    sprite = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(glow).text((m - l + 6, m - t + 10), text, font=font, fill=(0, 0, 0, 170), stroke_width=4)
    sprite = Image.alpha_composite(sprite, glow.filter(ImageFilter.GaussianBlur(10)))
    ImageDraw.Draw(sprite).text((m - l, m - t), text, font=font, fill="white", stroke_width=4, stroke_fill=(15, 15, 20))
    return sprite


def to_gif_frame(img):
    small = img.convert("RGB").resize((OUT_W, round(img.height * OUT_W / img.width)), Image.LANCZOS)
    return small.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)


def save_gif(frames, path):
    frames[0].save(
        path, save_all=True, append_images=frames[1:], duration=round(1000 / FPS), loop=0, optimize=True, disposal=1
    )


# ---------- banner ----------

def banner_state(t):
    """Return (left logo x, right logo x, text scale, pulse) at time t in seconds."""
    home_l, home_r = PAD, W - PAD - LOGO
    mid = (W - LOGO) / 2  # both logos end up exactly on top of each other here

    if t < IDLE:
        return home_l, home_r, 1.0, 0.0
    t -= IDLE
    if t < RUSH:
        p = ease_in_cubic(t / RUSH)
        xl, xr = lerp(home_l, mid, p), lerp(home_r, mid, p)
        # The text shrinks into the gap between the logos as they close in.
        gap, gap0 = xr - (xl + LOGO), home_r - (home_l + LOGO)
        return xl, xr, max(0.0, gap / gap0), 0.0
    t -= RUSH
    if t < MERGE:
        # merged: one logo that swells up once and settles
        return mid, mid, 0.0, math.sin(t / MERGE * math.pi)
    t -= MERGE
    if t < BACK:
        p = ease_in_out_cubic(t / BACK)
        return lerp(mid, home_l, p), lerp(mid, home_r, p), 0.0, 0.0
    t -= BACK
    if t < POP:
        return home_l, home_r, max(0.0, ease_out_back(t / POP)), 0.0
    return home_l, home_r, 1.0, 0.0


def place(frame, sprite, margin, x, y, scale=1.0, keep=None):
    """Paste a logo sprite so its logo (not the margin) is at x, y, scaled around its center.

    keep=("left"|"right", seam_x) only draws the part of the sprite on that side of seam_x.
    """
    if scale != 1.0:
        size = round(sprite.width * scale)
        sprite = sprite.resize((size, size), Image.LANCZOS)
        margin = margin * scale
        off = (LOGO * scale - LOGO) / 2
        x, y = x - off, y - off
    pos = (round(x - margin), round(y - margin))
    if keep:
        side, seam = keep
        cut = round(seam) - pos[0]
        sprite = sprite.copy()
        alpha = sprite.getchannel("A")
        hide = (cut, 0, sprite.width, sprite.height) if side == "left" else (0, 0, cut, sprite.height)
        if hide[2] > hide[0]:
            ImageDraw.Draw(alpha).rectangle(hide, fill=0)
        sprite.putalpha(alpha)
    frame.alpha_composite(sprite, pos)


def banner(text, out):
    bg = gradient().convert("RGBA")
    green, gm = logo_sprite("assets/source/logo-green.jpg")
    red, rm = logo_sprite("assets/source/logo-red.jpg")
    title = text_sprite(text)
    y = (H - LOGO) // 2

    frames = []
    for i in range(round(LOOP * FPS)):
        xl, xr, s, pulse = banner_state(i / FPS)
        frame = bg.copy()
        if s > 0.01:
            tw, th = max(1, round(title.width * s)), max(1, round(title.height * s))
            scaled = title.resize((tw, th), Image.LANCZOS)
            frame.alpha_composite(scaled, ((W - tw) // 2, (H - th) // 2))

        scale = 1 + 0.12 * pulse
        if pulse > 0:
            # soft white glow behind the merged logo
            glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            c = W / 2, H / 2
            r = LOGO * 0.62 * scale
            ImageDraw.Draw(glow).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=(255, 255, 255, round(150 * pulse)))
            frame = Image.alpha_composite(frame, glow.filter(ImageFilter.GaussianBlur(40)))
        # Where they overlap, the green logo owns everything left of the seam and the red one everything
        # right of it, so when they're fully merged it's one logo: half green, half red.
        seam = (xl + xr) / 2 + LOGO / 2
        place(frame, red, rm, xr, y, scale, keep=("right", seam))
        place(frame, green, gm, xl, y, scale, keep=("left", seam))
        frames.append(to_gif_frame(frame))

    save_gif(frames, out)
    print("saved", out, frames[0].size, len(frames), "frames")


# ---------- divider ----------

def divider(seconds=3.0):
    # Same width as the banner so both line up in Discord, but only 1/10 of the height.
    w, h = W, 40
    frames = []
    n = round(seconds * FPS)
    for i in range(n):
        phase = i / n  # one full cycle per loop, so it repeats seamlessly
        img = Image.new("RGB", (w, h))
        draw = ImageDraw.Draw(img)
        for x in range(w):
            # green -> red -> green across the strip, scrolling to the right
            t = (1 - math.cos(2 * math.pi * (x / w - phase))) / 2
            draw.line([(x, 0), (x, h)], fill=mix(GREEN, RED, t))
        frames.append(to_gif_frame(shade(img)))
    save_gif(frames, "assets/rules-divider.gif")
    print("saved assets/rules-divider.gif", frames[0].size, n, "frames")


if __name__ == "__main__":
    banner("Rules", "assets/rules-banner.gif")
    banner("Installation", "assets/installation-banner.gif")
    banner("Official Mods", "assets/official-mods-banner.gif")
    banner("Public Mods", "assets/public-mods-banner.gif")
    banner("Links", "assets/links-banner.gif")
    divider()
