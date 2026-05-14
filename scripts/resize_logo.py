from PIL import Image
import os

img_path = r'c:\Users\geova\Desktop\Nova pasta\LUME\assets\images\logoapp.png'
output_path = r'c:\Users\geova\Desktop\Nova pasta\LUME\assets\images\logoapp_square.png'

try:
    img = Image.open(img_path)
    # Criar uma imagem quadrada de 512x512 com fundo transparente (se for RGBA) ou branco
    size = (512, 512)
    new_img = Image.new("RGBA", size, (255, 255, 255, 0))
    
    # Redimensionar a imagem original mantendo a proporção para caber no 512x512
    img.thumbnail(size, Image.Resampling.LANCZOS)
    
    # Centralizar a imagem original na nova imagem quadrada
    offset = ((size[0] - img.size[0]) // 2, (size[1] - img.size[1]) // 2)
    new_img.paste(img, offset)
    
    new_img.save(img_path) # Sobrescrever a original com a versão quadrada
    print(f"Sucesso: {img_path} redimensionado para 512x512")
except Exception as e:
    print(f"Erro: {e}")
