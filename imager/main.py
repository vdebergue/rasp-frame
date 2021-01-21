import argparse

from PIL import Image, ImageDraw, ImageFont
from IT8951 import constants
from IT8951.display import AutoEPDDisplay

def main():
  parser = argparse.ArgumentParser(conflict_handler="resolve")
  parser.add_argument("--image", required=True)
  args = parser.parse_args()

  print(f"Reading image from {args.image}")

  display = AutoEPDDisplay(vcom=-1.55)
  print('VCOM set to', display.epd.get_vcom())

  # 1. Clear Display
  print('Clearing display...')
  display.clear()

  image = Image.open(args.image)
  dims = (1872,1404)
  image.thumbnail(dims)
  paste_coords = [dims[i] - image.size[i] for i in (0,1)]  # align image with bottom of display
  # image.show()
  print(f"{image}")
  display.frame_buf.paste(image, paste_coords)
  display.draw_full(constants.DisplayModes.GC16)
  print("done")


if __name__ == "__main__":
    main()