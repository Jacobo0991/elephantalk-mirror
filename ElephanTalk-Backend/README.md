## Índice

- [Repositorios](#repositorios)
- [Manuales de usuario](#manuales-de-usuario)
- [Aspectos generales](#aspectos-generales)
  - [Objetivos del Documento](#objetivos-del-documento)
  - [Descripción General](#descripción-general)
  - [Requerimientos del Sistema](#requerimientos-del-sistema)
  - [Software utilizado:](#software-utilizado)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
  - [Patrones de diseño](#patrones-de-diseño)
  - [Diagrama de modelo de datos](#diagrama-de-modelo-de-datos)
- [Guía de configuración](#guía-de-configuración)
  - [Configuración para el front end del sistema](#configuración-para-el-front-end-del-sistema)
  - [Configuración para el back end del sistema](#configuración-para-el-back-end-del-sistema)
- [Compatibilidad de licencias](#compatibilidad-de-licencias)
- [Tipos de error](#tipos-de-error)
- [Tablero](#tablero)
- [Geolocalización](#geolocalización)

## Repositorios
[![Frontend](https://badgen.net/badge/Frontend/ElephanTalk%20Principal%20App/blue?icon=https://codeberg.org/Codeberg/Design/raw/branch/main/logo/icon/svg/codeberg-logo_icon_blue.svg)](https://codeberg.org/kevocodes/ElephanTalk-Frontend)
[![Frontend](https://badgen.net/badge/Frontend/ElephanTalk%20Moderation/blue?icon=https://codeberg.org/Codeberg/Design/raw/branch/main/logo/icon/svg/codeberg-logo_icon_blue.svg)](https://codeberg.org/kevocodes/ElephanTalk-Moderation)
[![Backend](https://badgen.net/badge/Backend/ElephanTalk%20API/blue?icon=https://codeberg.org/Codeberg/Design/raw/branch/main/logo/icon/svg/codeberg-logo_icon_blue.svg)](https://codeberg.org/kevocodes/ElephanTalk-Backend)

## Manuales de usuario
Enlace de los manuales de usuario: [Manuales de usuario](https://github.com/kevocodes/ElephanTalk/tree/main/Documents)

## Aspectos generales

### Objetivos del Documento

Este documento técnico está diseñado para proporcionar una explicación detallada y comprensiva de la arquitectura, las tecnologías, y los procesos implementados en el desarrollo de ElephanTalk. Sirve como guía exhaustiva para el equipo de desarrollo y como manual de referencia para los administradores del sistema y futuros colaboradores.

### Descripción General

ElephanTalk es una plataforma de red social innovadora diseñada específicamente para estudiantes de informática y áreas afines, creada para fomentar la interacción y el intercambio de conocimientos en un entorno seguro y estimulante. La plataforma es dinámica, promoviendo activamente la discusión y colaboración en una variedad de temas tecnológicos y computacionales.

Una característica distintiva de ElephanTalk es la integración del modelo de aprendizaje automático Detoxify, reconocido en la comunidad de código abierto por su capacidad para analizar y detectar contenido tóxico en texto. Detoxify examina el tono y contenido de los mensajes en tiempo real, identificando y categorizando aquellos que podrían ser considerados abusivos, insultantes, o discriminatorios. Esta funcionalidad es esencial para mantener un ambiente de respeto y consideración, libre de las toxinas comúnmente encontradas en redes sociales tradicionales.

La implementación de Detoxify en ElephanTalk no solo mejora la moderación de contenido, sino que también proporciona a los usuarios una plataforma donde pueden expresarse libremente y de manera segura. Los mensajes y publicaciones son analizados automáticamente para detectar signos de toxicidad, ofreciendo una respuesta rápida y efectiva ante el abuso o acoso, lo cual es crucial para preservar la integridad de la comunidad.

Además, ElephanTalk incluirá funcionalidades avanzadas para la gestión de la moderación a través del modelo Detoxify. Esto abarcará desde la validación automática de comentarios y publicaciones hasta un sistema de reportes por parte de los usuarios, permitiendo denunciar contenido inapropiado. Estos reportes serán revisados por moderadores humanos en un proceso de verificación manual, asegurando así que incluso las sutilezas que el modelo automático podría pasar por alto sean adecuadamente gestionadas.

### Requerimientos del Sistema

Para garantizar una experiencia óptima y el funcionamiento correcto de ElephanTalk en un entorno de producción, es esencial que los usuarios accedan a la plataforma mediante un navegador web actualizado. Esto asegura la compatibilidad con las tecnologías modernas utilizadas en el desarrollo de ElephanTalk y permite una interacción fluida y segura con todas sus funcionalidades.

 **Requisitos de Software:**

**1. Aplicaciones en producción**

Para utilizar las aplicaciones del entorno ElephanTalk, es decir:
- https://elephantalk.vercel.app
- https://elephantalk-moderation.vercel.app

Únicamente es necesario lo siguiente: 

**Navegadores Web:** Los usuarios deben utilizar la versión más reciente de cualquier navegador web principal para asegurar la plena funcionalidad de las características de ElephanTalk. Los navegadores recomendados incluyen:

- Google Chrome
- Mozilla Firefox
- Safari
- Microsoft Edge

Mantener el navegador actualizado es crucial no solo para la compatibilidad con ElephanTalk, sino también para beneficiarse de las últimas mejoras en seguridad y rendimiento que los navegadores modernos ofrecen.

Esta configuración mínima garantiza que todos los componentes interactivos, las visualizaciones dinámicas y las operaciones de moderación de contenido se ejecuten de manera eficiente, proporcionando una experiencia de usuario excepcional y libre de problemas técnicos.

**2. Aplicaciones en entorno de desarrollo:**

Para desarrollar y mantener el sistema de ElephanTalk, se deben cumplir con los siguientes requisitos de software:

**Sistema Operativo:**

Se recomienda utilizar Windows 10 o una versión posterior para garantizar la compatibilidad y el rendimiento óptimo de las herramientas de desarrollo. Alternativamente, macOS y las distribuciones recientes de Linux también son compatibles.

**Node.js:**

- Versión: Node.js 20.x
- Uso: Necesario para el desarrollo del frontend principal en React y el backend de NestJS.
- Recomendación: Mantener Node.js actualizado a la versión estable más reciente dentro de la serie 20.x para beneficiarse de las mejoras de rendimiento y seguridad.

**Python:**

- Versión: Python 3.10
- Uso: Necesario para el desarrollo de la API en FastAPI.
- Recomendación: Mantener Python actualizado a la versión estable más reciente dentro de la serie 3.10 para asegurar la compatibilidad y estabilidad del entorno de desarrollo.

**NestJS:**

- Versión: La versión estable más reciente compatible con Node.js 20.x
- Uso: Para el desarrollo del sistema de moderación y la API principal.
- Recomendación: Utilizar la documentación oficial de NestJS para configurar y mantener el entorno de desarrollo.

**React:**

- Versión: La versión estable más reciente compatible con Node.js 20.x
- Uso: Para el desarrollo del frontend principal.
- Recomendación: Asegurarse de que todas las dependencias de React estén actualizadas para aprovechar las últimas características y mejoras de seguridad.

**FASTAPI:**

- Versión: La versión estable más reciente compatible con Python 3.10
- Uso: Para el desarrollo de la API secundaria.
- Recomendación: Seguir las guías de instalación y configuración proporcionadas en la documentación oficial de FastAPI.

**Herramientas de Desarrollo:**

- IDE/Editor de Código: Visual Studio Code, WebStorm, PyCharm o cualquier otro editor que soporte desarrollo en JavaScript y Python.
- Control de Versiones: Git (Se recomienda la última versión estable).
- Gestor de Paquetes:
  - npm: Para gestionar las dependencias de Node.js.
  - pip: Para gestionar las dependencias de Python.
- Navegador Web: Un navegador web actualizado (Google Chrome, Mozilla Firefox, Safari o Microsoft Edge) para probar y depurar la interfaz de usuario y las funcionalidades del sistema.

Estos requisitos aseguran que los desarrolladores cuenten con un entorno de trabajo adecuado para implementar, probar y mantener las aplicaciones de ElephanTalk de manera eficiente.

### Software utilizado:

Para el desarrollo de ElephanTalk, se seleccionaron diversas herramientas y tecnologías que facilitan la creación, prueba y despliegue de la plataforma. A continuación, se detalla cada uno de los componentes de software utilizados:

**React.js:** Utilizado para construir el frontend de la aplicación, React.js es una biblioteca de JavaScript para construir interfaces de usuario de forma eficiente y declarativa. React facilita la creación de componentes interactivos y reutilizables, ideal para la dinámica de una red social como ElephanTalk.

**NestJS:** Un framework progresivo para Node.js utilizado para construir aplicaciones de servidor eficientes y escalables. NestJS usa TypeScript y combina elementos de Programación Orientada a Objetos (POO), Programación Funcional y Programación Reactiva, proporcionando una arquitectura bien estructurada que es fácil de mantener.

**MongoDB con Mongoose:** MongoDB es un sistema de base de datos NoSQL que ofrece alta performance, alta disponibilidad y fácil escalabilidad. Mongoose es una biblioteca para MongoDB y Node.js que facilita la modelación de objetos y manejo de datos con una API sencilla y basada en esquemas para modelar la información de la aplicación.

**FastAPI:** Utilizado para el microservicio que maneja Detoxify, FastAPI es un framework moderno y rápido (de alto rendimiento) para construir APIs con Python 3.7+ basado en las mejores prácticas de tipo anotado. FastAPI facilita la creación de APIs robustas y eficientes que pueden manejar las solicitudes de análisis de contenido de ElephanTalk de manera efectiva.

**Vite y Tailwind CSS:** Vite es una herramienta de construcción de frontend que mejora significativamente la experiencia de desarrollo con su reinicio instantáneo del servidor. Tailwind CSS es un framework de CSS que permite diseñar rápidamente interfaces personalizadas sin salir del HTML, facilitando la creación de un diseño coherente y responsivo para ElephanTalk.

**Versiones Específicas:**

- React.js: v17.0.2
- NestJS: v8.0
- MongoDB: v4.4
- Mongoose: v5.13.8
- FastAPI: v0.65.2
- Vite: v2.6
- Tailwind CSS: v2.2

Estas herramientas y tecnologías han sido escogidas no solo por su robustez y escalabilidad, sino también por su compatibilidad y facilidad para integrarse entre sí, asegurando así un desarrollo fluido y un mantenimiento sencillo de ElephanTalk.

## Arquitectura del Sistema

### Patrones de diseño

ElephanTalk implementa una combinación de patrones de diseño tanto en el frontend como en el backend para optimizar la arquitectura de la aplicación y mejorar la experiencia de desarrollo y usuario.

**Frontend:**

- **Composition Pattern y Higher Order Component (HOC) Pattern:** Estos patrones se utilizan en React para mejorar la reutilización de la lógica y la composición de componentes. HOC permite envolver un componente dentro de otro, agregando o compartiendo funcionalidades, lo que resulta en una mejor separación de la lógica y la interfaz.

- **Observer Pattern:** Este patrón facilita la comunicación entre los componentes cuando se produce un cambio de estado. Es esencial para manejar actualizaciones en tiempo real en la interfaz de usuario, especialmente útil en una red social donde los datos como mensajes y notificaciones cambian frecuentemente.

**Backend:**

- **Dependency Injection Pattern:** Utilizado extensivamente en NestJS, este patrón permite desacoplar los componentes del sistema, facilitando un sistema más modular y testeable. Al inyectar dependencias, cada módulo no necesita conocer los detalles de las dependencias necesarias para operar, lo que simplifica la expansión y mantenimiento del backend.

- **Singleton Pattern:** Este patrón asegura que una clase tenga una única instancia, y proporciona un punto de acceso global a ella. En ElephanTalk, se utiliza para manejar la configuración del sistema y la conexión a la base de datos, garantizando que solo exista una instancia de cada una por proceso.

**Ambos (Frontend y Backend):**

- **Adapter Pattern:** Este patrón juega un papel crucial en la integración entre el frontend desarrollado en React y el backend en NestJS. Facilita la conversión de la interfaz de una clase en otra que los clientes esperan, permitiendo que los componentes con interfaces incompatibles trabajen juntos. Esto es particularmente útil para transformar los datos entre el formato que utiliza MongoDB y los requisitos del frontend, asegurando una transmisión de datos fluida y coherente.

**Justificación/Implementación del Uso en el Proyecto:**

La adopción de estos patrones en ElephanTalk ha traído múltiples beneficios:

- **Mantenimiento y Evolución del Sistema:** Los patrones como HOC y Dependency Injection permiten un mantenimiento más sencillo y una evolución sistemática sin grandes alteraciones en el sistema existente.

- **Reutilización de Componentes y Lógica:** El uso de patrones como Composition y Observer en el frontend facilita la reutilización de la lógica y mejora la gestión de estado, lo que reduce errores y duplicación de código.

- **Flexibilidad y Escalabilidad:** Los patrones de diseño implementados proporcionan una base sólida que ofrece flexibilidad en el desarrollo y escalabilidad del sistema, permitiendo adaptar fácilmente ElephanTalk a nuevas necesidades y tecnologías emergentes.

La implementación de estos patrones refleja un enfoque estructurado y bien pensado para el desarrollo de software, asegurando que ElephanTalk no solo cumpla con los requisitos actuales sino que también esté preparada para futuras expansiones y mejoras.

### Diagrama de modelo de datos

![no relation db](https://github.com/kevocodes/ElephanTalk/assets/62626446/a8e9fa4e-9233-4ae6-b189-5d2a4d809b90)

## Guía de configuración

### Configuración para el front end del sistema

Configuración
Copiar el archivo `.env.example` y renombrarlo a `.env`. Es importante asegurarse de tener las siguientes variables de entorno:

```plaintext
# URL base de la API pública
VITE_PUBLIC_API_URL=""

# Cantidad de publicaciones por página para desplazamiento infinito
VITE_POSTS_PER_PAGE=10

# URL PhotonAPI
VITE_PHOTON_API_URL=""
```

Pruebas
Para ejecutar las pruebas unitarias:
```sh
$ yarn run test
```

Para ejecutar las pruebas e2e:
```sh
$ yarn run test:e2e
```

Para ejecutar las pruebas e2e con interfaz gráfica:
```sh
$ yarn run test:e2e:open
```

Requisitos previos para pruebas e2e
Configurar las variables de entorno de prueba
Para poder ejecutar las pruebas e2e, es necesario crear el archivo `cypress.env.json` en la raíz del proyecto, donde se configurarán las siguientes variables de entorno:

```json
{
  "AUTH_USER": "nombredeusuarioocorreo",
  "AUTH_PASSWORD": "contraseña"
}
```

`AUTH_USER`: Es el nombre de usuario o correo electrónico de un usuario válido y activo en la aplicación.

`AUTH_PASSWORD`: Es la contraseña del usuario válido y activo en la aplicación.

Configurar la URL base de la aplicación
Es necesario que la aplicación esté en ejecución para poder ejecutar las pruebas e2e. Dado que la aplicación se construye con Vite, por defecto se ejecuta en el puerto 5173, por lo que la URL base configurada en Cypress es `http://localhost:5173`. Sin embargo, si se desea cambiar esta URL base (por ejemplo, si la aplicación está ejecutándose en el puerto 3000), se debe ejecutar el comando de prueba e2e de la siguiente manera:

```sh
yarn run test:e2e --config baseUrl="http://localhost:3000"
```

### Configuración para el back end del sistema

Este proyecto consiste en dos servicios: una API de NestJS y una API de FastAPI. Ambos servicios están configurados para ejecutarse en contenedores Docker utilizando Docker Compose.

Para la función de obtener los datos de país y ciudad de los posts se hace uso de una API de PhotonAPI. Este servicio no esta configurado para ejecutarse en un contenedor de Docker, se debe inicializar manualmente de la siguiente manera:

**PhotonAPI**

Para levantar el servicio de PhotonAPI (usado para obtener los datos de ciudad y país a partir de las coordenadas) es necesario abrir una ventana de **Command Prompt (Símbolo del Sistema)** y ejecutar el siguiente comando:

```plaintext
java -jar photon-opensearch-0.7.0.jar -cors-any
```


**Requisitos**

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Java 11+](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html)

**Configuración**

Antes de construir y ejecutar los contenedores, asegúrate de tener el siguiente archivo `.env` en la raíz del proyecto de la API de NestJS (`./API/.env`):

```plaintext
MONGO_URI="mongodb://localhost:27017/tu-base-de-datos"
PORT=3000
JWT_SECRET="tu-secreto-jwt"
TOXICITY_URL="http://fastapi-service:8000"
TOXICITY_THRESHOLD=0.25
```

Asegúrate de actualizar los valores según sea necesario para tu entorno.

1. Clona este repositorio en tu máquina local.

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

2. Navega al directorio del proyecto y asegúrate de tener el archivo `.env` en la ubicación correcta (`./API/.env`).

3. Construye y levanta los servicios usando Docker Compose.

```bash
docker-compose up --build
```

Esto construirá las imágenes Docker para ambos servicios y los levantará en sus respectivos puertos.

**Servicios**

- **NestJS API**: disponible en `http://localhost:3000`
- **FastAPI Service**: disponible en `http://localhost:8000`
- **PhotonAPI Service**: disponible en `http://localhost:2322`

**Detalles del Docker Compose**

El archivo `docker-compose.yml` define dos servicios:

- `nestjs-api`: La API de NestJS.
- `fastapi-service`: La API de FastAPI para moderación.

Ambos servicios están conectados a una red Docker llamada `backend-network`.

**Dockerfile de NestJS API**

El Dockerfile de la API de NestJS realiza los siguientes pasos:

1. Usa una imagen base con Node.js 20.
2. Establece el directorio de trabajo.
3. Copia los archivos `package.json` y `package-lock.json` y las instala.
4. Copia el resto de los archivos de la aplicación.
5. Copia el archivo `.env`.
6. Compila el proyecto.
7. Expone el puerto `3000`.
8. Define el comando para correr la aplicación.

**Dockerfile de FastAPI**

El Dockerfile de la API de FastAPI realiza los siguientes pasos:

1. Usa una imagen base con Python 3.10.
2. Establece el directorio de trabajo.
3. Copia el archivo `requirements.txt` e instala las dependencias.
4. Descarga y almacena el modelo de clasificación en una capa de la imagen.
5. Copia el resto de los archivos de la aplicación.
6. Expone el puerto `8000`.
7. Define el comando para correr la aplicación.


**Notas**

- Asegúrate de tener Docker y Docker Compose correctamente instalados y configurados en tu sistema.
- Si necesitas hacer cambios en la configuración, actualiza los archivos `.env` y los Dockerfiles según sea necesario.
- Para detener los servicios, puedes usar `Ctrl+C` en la terminal donde están corriendo o ejecutar `docker-compose down` para detener y eliminar los contenedores.

¡Eso es todo! Ahora deberías tener tus servicios de NestJS y FastAPI corriendo en contenedores Docker listos para usar.

## Compatibilidad de licencias

- Link de documento para la compatibilidad de Licencias: [Compatibilidad de licencias](https://drive.google.com/file/d/1XWfnQ94D2FU2hRjfB68xmK-rrG4RnC6i/view?usp=sharing) 
- Link de documento de escaneo de licencias: [Escaneo de licencias](https://drive.google.com/file/d/1rm_bZgwtU5UqfLoGs-jiXyQvV1b_oSwX/view?usp=sharing)

## Tipos de error

La herramienta "Projects" de GitHub ha sido esencial para organizar y dar seguimiento a cada error de manera estructurada en nuestro proyecto. Cada issue se ha creado como una tarjeta en el tablero de proyectos, con un título descriptivo, etiquetas relevantes y un responsable asignado para su solución. Este tablero ofrece un registro detallado de todos los problemas y errores encontrados durante el desarrollo y despliegue del aplicativo.

Cada issue incluye una descripción clara del problema, con información relevante como el mensaje de error, el archivo afectado, los pasos para reproducir el error, las causas identificadas y las acciones tomadas para solucionarlo. Se ha cuidado la claridad de los comentarios y soluciones, utilizando términos comprensibles y explicando el razonamiento detrás de cada solución implementada.

Las tarjetas se mueven a través de diferentes columnas que representan las etapas del ciclo de vida de un error, como "Backlog", "In Progress" y "Done", lo que permite una visualización clara del estado de cada error y facilita la colaboración entre los miembros del equipo. La documentación exhaustiva y clara ha sido priorizada para evitar confusiones y garantizar una experiencia fluida durante el desarrollo y pruebas del proyecto.

Enlace de GitHub Projects: [Projects](https://github.com/users/kevocodes/projects/3/views/1)

## Tablero

Enlace a Taiga: [Tablero de Taiga](https://tree.taiga.io/project/kevocodes-elephantalk-aca/kanban)

## Geolocalización

Elephantalk ahora permite agregar la **ubicación** a tus posts!
En esta seccion se encuentra todo lo relacionado a la geolocalización

### Detalles sobre el Frontend

#### Obtener ubicación del post

para obtener los detalles de la ubicación actual del dispositvo se hace uso de la Geolocation API por parte del navegador y se almacenan las coordenadas latitud y longitud haciendo uso de la siguiente funcion en la parte del frontend de la aplicacion:

```
// Obtener ubicación del usuario
useEffect(() => {
  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  getUserLocation();
}, []);
```

De modo que al crear un post, ahora tenemos la posibilidad de marcar un checkbox llamado *Add my location to this post*:

![create1](https://github.com/user-attachments/assets/541aab52-2e65-4c20-b507-85a8cf7f9777)

Luego de marcar el checkbox, necesitaremos dar permisos al sitio web de poder acceder a nuestra ubicación a traves del navegador. Una vez el permiso ha sido otorgado, se abrira un pequeño mapa en en cual, de forma automatica se fijara un marcador en nuetra ubicación actual como se muestra en la imagen a continuación, ademas, si lo deseamos, podemos elegir otra ubicación dando click en otra parte del mapa.

![create2](https://github.com/user-attachments/assets/50457beb-2f92-4f1a-adbc-ded097981483)

#### Separación de posts

ElephanTalk ahora tiene separados los posts en dos secciones, la sección **Cerca de ti** muestra todos los post que han sido publicados en tu zona y la sección **Todo El Salvador** muestra todos los posts del país!

Para podes hacer la clasificacion de los posts se hace uso del servicio *PhotonAPI* mediante la siguiente función:

```
// Clasificar posts cuando cambian los posts o la ubicación
useEffect(() => {
  if (!userLocation || !posts.length) return;

  const classifyPosts = async () => {
    const local = [];
    const global = [];
    let City, Country;

    await fetch(`${PhotonAPI}/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&radius=0.1`)
      .then(response => response.json())
      .then(data => {
        if (data.features.length > 0) {
          setUserCity(data.features[0].properties.city);
          setUserCountry(data.features[0].properties.country);
          City = data.features[0].properties.city;
          Country = data.features[0].properties.country;
        }
      });

    posts.forEach(post => {
      if (!post.country && !post.city) {
        global.push(post);
      } else if (post.country === Country && post.city === City) {
        local.push(post);
        global.push(post);
      } else {
        global.push(post);
      }
    });

    setLocalPosts(local);
    setGlobalPosts(global);
    setIsLoading(false);
  };

  classifyPosts();
}, [posts, userLocation]);

useEffect(() => {}, [userCity, userCountry]);
```
Esto lo que hace es que obtiene los datos de ubicación del usuario para poder generar un radio que es el que se considera *Cerca de ti* para poder identificar la ciudada en la que se encuntra el usuario y a traves de eso, clasificar los posts segun sus datos de ubicación para considerarlos cercanos o globales.

La vista de la nueva UI en ambas secciones es la siguientes:

Cerca de ti:

![post1](https://github.com/user-attachments/assets/c3e6aa00-d497-4ae2-8631-b8675af70a96)

Todo El Salvador:

![post2](https://github.com/user-attachments/assets/a115ca53-67d4-4b1b-b291-08d6e9ebff57)


### Detalles sobre el Backend

En cuanto al backend, se mantiene la logica de manejo de los posts, sin embargo, si hicieron pequeños ajustes para poder manejar los datos adiciones de la ubicación de estos, de modo que los objetos en formato json de los posts quedan de la siguiente manera:

```
{
  "_id": "6860f0812d66868463aaa3364",
  "description": "ANUIDNUAIWNDU9AWH9DAW",
  "image": "https://i.imgflip.com/9mj9dy.jpg",
  "location": {
    "country": "El Salvador",
    "city": "San Salvador"
  },
  "active": true,
  "manualReviewed": false,
  "user": "6860e4dd2d66868463aa327d",
  "likes": [],
  "comments": [],
  "createdAt": "2025-06-29T07:51:29.431+00:00",
  "updatedAt": "2025-06-29T07:51:29.431+00:00",
  "__v": 0
}
```

Como se puede observar, el objeto de los posts ahora maneja el atributo *location* para almacenar los datos de pais y ciudad de un post, sin embargo, agregar la ubicación a un post es algo completamente opcional, por lo tano, un objeto de post también puede manejar estos campos si son *null* como se muestra en el siguiente ejemplo:

```
{
  "_id": "6860e8ec2d66868463aa32ac",
  "description": "Happening",
  "image": "https://i.imgflip.com/9mj9dy.jpg",
  "location": {
    "country": null,
    "city": null
  },
  "active": true,
  "manualReviewed": false,
  "user": "6860e4ddd2d66868463aa327d",
  "likes": [],
  "comments": [],
  "createdAt": "2025-06-29T07:19:08.540+00:00",
  "updatedAt": "2025-06-29T07:19:08.540+00:00",
  "__v": 0
}
```




