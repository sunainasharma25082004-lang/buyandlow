from PIL import Image

img = Image.open(r'C:\Users\M4\.gemini\antigravity-ide\brain\c9b0d003-e2fc-46d6-95ce-5115298fffab\.user_uploaded\media_1791444174247.jpg')
width, height = img.size

# Let's crop the hero banner!
# In the image (1024x576):
# The navbar is at top: approx y = 0 to 50
# The hero banner is approx y = 50 to 240
# The categories are approx y = 250 to 370
# The trending products are approx y = 380 to 570

# Let's save a crop of the hero banner right side (the product composition):
# And each category icon if helpful!
hero_banner = img.crop((30, 52, 994, 242))
hero_banner.save(r'c:\viz\app\BUYLOWINDIA\buyandlow\client\src\assets\hero_banner_ref.jpg')

# Let's also crop the hero right side products image:
# width of banner is 964, right side starts around x=420 to 994
hero_products = img.crop((430, 52, 994, 242))
hero_products.save(r'c:\viz\app\BUYLOWINDIA\buyandlow\client\src\assets\hero_products_composition.png')

print("Cropped successfully!")
