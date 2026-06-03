# Usa una imagen base con Python
FROM python:3.10

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo de requerimientos
COPY requirements.txt ./

# Instala las dependencias de la aplicación
RUN pip install --no-cache-dir -r requirements.txt

# Descarga y almacena el modelo en una capa de la imagen
RUN mkdir -p /root/.cache/torch/hub/checkpoints/ && \
    wget -O /root/.cache/torch/hub/checkpoints/multilingual_debiased-0b549669.ckpt https://github.com/unitaryai/detoxify/releases/download/v0.4-alpha/multilingual_debiased-0b549669.ckpt

# Copia el resto de los archivos de la aplicación
COPY . .

# Expone el puerto en el que correrá la aplicación
EXPOSE 8000

# Define el comando para correr la aplicación
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
