from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw, ImageFont
import io

app = FastAPI()

# Configurações da imagem
IMAGE_SIZE = (200, 200)
BACKGROUND_COLOR = (255, 255, 255)  # Branco
TEXT_COLOR = (0, 0, 0)  # Preto
FONT_SIZE = 160

# Criar uma fonte básica
try:
    font = ImageFont.truetype("arial.ttf", FONT_SIZE)
except:
    # Fallback para fonte básica se arial não estiver disponível
    font = ImageFont.load_default()

@app.get("/images/{number}.png")
async def generate_number_image(number: int):
    # Criar uma nova imagem
    img = Image.new("RGB", IMAGE_SIZE, BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Calcular a posição do texto para centralizar
    text = str(number)
    
    # Método atualizado para obter o tamanho do texto
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    text_width = right - left
    text_height = bottom - top
    
    position = (
        (IMAGE_SIZE[0] - text_width) // 2,
        (IMAGE_SIZE[1] - text_height) // 2
    )
    
    # Desenhar o número na imagem
    draw.text(position, text, fill=TEXT_COLOR, font=font)
    
    # Salvar a imagem em um buffer de bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    # Retornar a imagem como resposta
    return StreamingResponse(img_byte_arr, media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="10.0.0.20", port=7777)