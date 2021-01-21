import argparse

from PIL import Image, ImageDraw, ImageFont, ImageEnhance

dims = (1872,1404)

def main():
  parser = argparse.ArgumentParser(conflict_handler="resolve")
  parser.add_argument("--image", required=True)
  args = parser.parse_args()

  print(f"Reading image from {args.image}")

  from IT8951 import constants
  from IT8951.display import AutoEPDDisplay
  display = AutoEPDDisplay(vcom=-1.55)
  print('VCOM set to', display.epd.get_vcom())

  # 1. Clear Display
  print('Clearing display...')
  display.clear()

  image = Image.open(args.image)
  image = resize_image(image, dims)
  image = enhance_image(image)
  paste_coords = get_paste_coords(image)
  # image.show()
  print(f"{image}")
  image = image.transpose(Image.FLIP_LEFT_RIGHT)
  display.frame_buf.paste(image, paste_coords)
  display.draw_full(constants.DisplayModes.GC16)
  print("done")

def get_paste_coords(image):
  # return [dims[i] - image.size[i] for i in (0,1)]  # align image with bottom of display
  return [dims[i]//2  - image.size[i]//2 for i in (0,1)]  # align image with middle of display

def resize_image(image, target_dims):
  image = crop_to_aspect(image, dims[0], dims[1])
  image.thumbnail(target_dims)
  return image

def enhance_image(image):
  contrast = ImageEnhance.Contrast(image)
  image = contrast.enhance(1.1)
  sharpness = ImageEnhance.Sharpness(image)
  image = sharpness.enhance(1.1)
  return image

def crop_to_aspect(image, aspect, divisor=1, alignx=0.5, aligny=0.5):
    """Crops an image to a given aspect ratio.
    Args:
        aspect (float): The desired aspect ratio.
        divisor (float): Optional divisor. Allows passing in (w, h) pair as the first two arguments.
        alignx (float): Horizontal crop alignment from 0 (left) to 1 (right)
        aligny (float): Vertical crop alignment from 0 (left) to 1 (right)
    Returns:
        Image: The cropped Image object.
    """
    if image.width / image.height > aspect / divisor:
        newwidth = int(image.height * (aspect / divisor))
        newheight = image.height
    else:
        newwidth = image.width
        newheight = int(image.width / (aspect / divisor))
    img = image.crop((alignx * (image.width - newwidth),
                      aligny * (image.height - newheight),
                      alignx * (image.width - newwidth) + newwidth,
                      aligny * (image.height - newheight) + newheight))
    return img

if __name__ == "__main__":
  main()
  # image = Image.open("tmp/image.jpg")
  # image = enhance_image(image)
  # image = resize_image(image, dims)
  # image.show()
