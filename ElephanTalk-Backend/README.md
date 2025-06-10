# API - Monorepo Backend

Guía de Configuración y Uso de Docker para APIs de NestJS y FastAPI

## Requisitos Previos

- Asegúrate de tener Docker instalado en tu máquina. Si necesitas instalar Docker, visita el sitio oficial de Docker para las instrucciones de instalación adecuadas para tu sistema operativo.

## Estructura del Proyecto

Tu proyecto debe tener la siguiente estructura:

```bash
/path/to/your/project
├── docker-compose.yml
├── API
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── ...
└── MicroserviceModeration
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py
    └── ...
```

## Configuración de Variables de Entorno (.env)
**Importante:** Antes de construir y ejecutar los contenedores, es crucial configurar correctamente los archivos `.env` para cada servicio. Estos archivos contienen variables de entorno necesarias para el funcionamiento de las aplicaciones, como credenciales de bases de datos, claves API, entre otros.

## Configuración del Docker Compose

El archivo `docker-compose.yml` está configurado para levantar tanto la API de NestJS como la de FastAPI en servicios separados. Asegúrate de estar en la raíz del repositorio antes de ejecutar los siguientes comandos.

## Pasos para Construir y Ejecutar

Construye y levanta los servicios usando Docker Compose:

```bash
docker compose build
```

Luego para levantar los servicios

```bash
docker compose up -d
```

## Comandos Útiles

Para detener los servicios:
docker-compose down

- Para detener un contenedor específico:

```bash
docker stop <nombre-del-contenedor>
```

- Para iniciar un contenedor específico:

```bash
docker start <nombre-del-contenedor>
```

- Para reiniciar un contenedor específico:

```bash
docker restart <nombre-del-contenedor>
```

- Para ver los logs de un contenedor específico:

```bash
docker logs <nombre-del-contenedor>
```

## Notas Adicionales

- Asegúrate de que los archivos `.env` necesarios estén correctamente configurados antes de construir las imágenes Docker.
- Si necesitas conectarte a una base de datos, asegúrate de que los servicios estén en la misma red de Docker especificada en `docker-compose.yml`.
- Nunca subas archivos `.env` a repositorios públicos. Utiliza .gitignore para excluirlos de tus commits.

