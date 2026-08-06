from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(".")
out = root / "public" / "favicon.ico"

# Garante a pasta public
out.parent.mkdir(parents=True, exist_ok=True)

# Cria imagens em tamanhos diferentes
sizes = [16, 32, 48]
images = []

for size in sizes:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fundo azul quadrado
    padding = 1
    draw.rounded_rectangle(
        (padding, padding, size - padding - 1, size - padding - 1),
        radius=max(2, size // 6),
        fill=(20, 93, 255, 255)
    )

    # Texto "CD"
    try:
        font_size = max(8, size // 2)
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    text = "CD"
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) // 2
    y = (size - h) // 2

    draw.text((x, y), text, fill="white", font=font)
    images.append(img)

# Salva como ICO com múltiplos tamanhos
images[0].save(out, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Favicon criado em: {out}")