"""Build the README preview GIF from project-owned artwork."""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "screenshots" / "demo.gif"
SOURCES = [
    ROOT / "docs" / "screenshots" / "readme-hero.png",
    ROOT / "src" / "assets" / "growingBackground.jpg",
    ROOT / "src" / "assets" / "bukets.jpg",
    ROOT / "src" / "assets" / "earning.jpg",
    ROOT / "src" / "assets" / "money.jpeg",
]
SIZE = (900, 506)


def cover(image: Image.Image, size: tuple[int, int], zoom: float) -> Image.Image:
    source = image.convert("RGB")
    scale = max(size[0] / source.width, size[1] / source.height) * zoom
    resized = source.resize(
        (round(source.width * scale), round(source.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def main() -> None:
    frames: list[Image.Image] = []

    for source_path in SOURCES:
        with Image.open(source_path) as source:
            for zoom in (1.0, 1.025, 1.05):
                frame = cover(source, SIZE, zoom)
                frame = ImageEnhance.Color(frame).enhance(1.05)
                frame = frame.filter(ImageFilter.GaussianBlur(radius=0.15))
                frames.append(frame)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=650,
        loop=0,
        optimize=True,
    )


if __name__ == "__main__":
    main()
