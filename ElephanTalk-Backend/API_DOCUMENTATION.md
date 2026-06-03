# ElephanTalk — Documentación Oficial de la API

> Generada a partir del código fuente. Versión `1.0` · Base de código: `develop`

---

## Tabla de Contenidos

1. [Información General](#1-información-general)
2. [Autenticación](#2-autenticación)
3. [Modelos de Datos](#3-modelos-de-datos)
4. [Módulo Auth](#4-módulo-auth)
5. [Módulo Users](#5-módulo-users)
6. [Módulo Posts](#6-módulo-posts)
7. [Módulo Events](#7-módulo-events)
8. [Módulo Toxicity Reports](#8-módulo-toxicity-reports)
9. [Microservicio de Moderación (FastAPI)](#9-microservicio-de-moderación-fastapi)
10. [Códigos de Error Globales](#10-códigos-de-error-globales)

---

## 1. Información General

### Servicios

| Servicio | Tecnología | Puerto | URL Base |
|---|---|---|---|
| API Principal | NestJS (Node.js) | `3000` | `http://localhost:3000` |
| Microservicio de Moderación | FastAPI (Python) | `8000` | `http://localhost:8000` |
| Documentación Swagger | — | `3000` | `http://localhost:3000/docs` |

### Convenciones Generales

- Todas las respuestas de la API principal están en formato `application/json`.
- Los endpoints que devuelven un solo recurso lo envuelven en `{ "data": {...} }`.
- Los endpoints paginados devuelven `{ "data": [...], "pagination": {...} }`.
- Los `id` de path son **MongoDB ObjectId** (24 caracteres hexadecimales). Un valor inválido retorna `400 Bad Request`.
- La validación de body rechaza campos no declarados en el DTO (`forbidNonWhitelisted: true`).
- Todos los campos `string` con `@Transform(trim)` eliminan espacios al inicio y al final.

---

## 2. Autenticación

La API usa **JWT Bearer Token**.

### Obtener un token
Realiza `POST /auth/login` o `POST /auth/register`. La respuesta incluye `access_token`.

### Usar el token
Incluye el header en cada petición protegida:

```
Authorization: Bearer <access_token>
```

### Vida útil del token
**7 días** desde su emisión.

### Payload del token (decodificado)
```json
{
  "sub": "64a1f3b2c8e4d20012345678",
  "role": "user"
}
```

### Roles disponibles

| Rol | Valor | Descripción |
|---|---|---|
| Usuario estándar | `"user"` | Rol por defecto al registrarse |
| Administrador | `"admin"` | Acceso completo, incluyendo moderación |

---

## 3. Modelos de Datos

Esquemas de referencia tal como están definidos en MongoDB.

### User
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | Generado por MongoDB |
| `username` | string | sí | Único, trimmed |
| `email` | string | sí | Único, lowercase |
| `name` | string | sí | |
| `lastname` | string | sí | |
| `picture` | string | sí | URL generada con Pravatar |
| `password` | string | sí | Hash bcrypt, excluido de selects por defecto |
| `role` | `"user"` \| `"admin"` | sí | Default: `"user"` |
| `favorites` | ObjectId[] | — | Referencias a Posts, default `[]` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

### Post
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `description` | string | sí | Pasa por filtro de toxicidad |
| `image` | string | sí | URL válida |
| `location` | `{lat, lng}` | no | Coordenadas GPS |
| `country` | string | no | |
| `city` | string | no | |
| `active` | boolean | — | Default: `true` |
| `manualReviewed` | boolean | — | Default: `false`. Se activa tras decisión de reporte |
| `user` | ObjectId | sí | Ref → User |
| `likes` | ObjectId[] | — | Refs → Users, default `[]` |
| `comments` | ObjectId[] | — | Refs → Comments, default `[]` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

### Comment
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `content` | string | sí | Pasa por filtro de toxicidad |
| `manualReviewed` | boolean | — | Default: `false` |
| `user` | ObjectId | sí | Ref → User |
| `post` | ObjectId | sí | Ref → Post |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

### Event
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `title` | string | sí | Pasa por filtro de toxicidad |
| `description` | string | sí | Pasa por filtro de toxicidad |
| `date` | Date | sí | Fecha del evento |
| `schedule.startTime` | string | sí | Ej: `"14:00"` |
| `schedule.endTime` | string | no | Ej: `"18:00"` |
| `location` | `{lat, lng}` | no | |
| `country` | string | no | |
| `city` | string | no | |
| `address` | string | no | |
| `active` | boolean | — | Default: `true` |
| `capacity` | number | no | Entero ≥ 1 |
| `user` | ObjectId | sí | Ref → User (creador) |
| `attendees` | ObjectId[] | — | Refs → Users, default `[]` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

### Report
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `content` | string | sí | Texto del elemento reportado (copiado al crear) |
| `tags` | string[] | sí | Categorías de toxicidad detectadas |
| `reportedElementId` | string | sí | ObjectId del Post o Comment reportado |
| `type` | `"post"` \| `"comment"` | sí | |
| `status` | `"pending"` \| `"accepted"` \| `"rejected"` | — | Default: `"pending"` |
| `user` | ObjectId | sí | Ref → User (autor del elemento reportado) |
| `reviewer` | ObjectId | no | Ref → User (admin que revisó), default `null` |
| `revisionDate` | Date | no | Fecha de decisión, default `null` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

---

## 4. Módulo Auth

**Prefijo:** `/auth`  
**Autenticación requerida:** Solo en `GET /auth/whoami`

---

### 4.1 Login de Usuario

**`POST /auth/login`**

Autentica un usuario con su `username` o `email` y `password`. Retorna un JWT.

#### Request Body
```json
{
  "username": "johndoe",
  "password": "mysecretpass"
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `username` | string | sí | Puede ser username o email |
| `password` | string | sí | |

#### Respuestas

**`201 Created` — Login exitoso**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**`401 Unauthorized` — Credenciales inválidas**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 4.2 Login de Administrador

**`POST /auth/login/admin`**

Idéntico a `POST /auth/login` pero valida que el usuario tenga `role: "admin"`. Si las credenciales son válidas pero el rol no es `admin`, retorna `401`.

#### Request Body
```json
{
  "username": "adminuser",
  "password": "adminpassword"
}
```

#### Respuestas

**`201 Created` — Login admin exitoso**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**`401 Unauthorized` — Credenciales inválidas o rol insuficiente**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 4.3 Registro de Usuario

**`POST /auth/register`**

Crea un nuevo usuario con rol `"user"`. La `picture` se genera automáticamente usando Pravatar (`https://i.pravatar.cc/150?u=<username>`). El password se almacena hasheado con bcrypt.

#### Request Body
```json
{
  "username": "johndoe",
  "name": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "mysecretpass"
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `username` | string | sí | Mínimo 4 caracteres, trimmed |
| `name` | string | sí | No vacío, trimmed |
| `lastname` | string | sí | No vacío, trimmed |
| `email` | string | sí | Formato email válido |
| `password` | string | sí | Mínimo 8 caracteres, trimmed |

#### Respuestas

**`201 Created` — Registro exitoso** (el campo `password` no se incluye en la respuesta)
```json
{
  "data": {
    "_id": "64a1f3b2c8e4d20012345678",
    "username": "johndoe",
    "name": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "picture": "https://i.pravatar.cc/150?u=johndoe",
    "role": "user",
    "favorites": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**`400 Bad Request` — Email o username ya existe**
```json
{
  "statusCode": 400,
  "message": ["Email already exists.", "Username already exists."],
  "error": "Bad Request"
}
```

---

### 4.4 Obtener Perfil Propio

**`GET /auth/whoami`**  
**Requiere:** `Bearer Token`

Retorna los datos del usuario autenticado (sin password ni favorites).

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "_id": "64a1f3b2c8e4d20012345678",
    "username": "johndoe",
    "picture": "https://i.pravatar.cc/150?u=johndoe",
    "name": "John",
    "lastname": "Doe"
  }
}
```

**`401 Unauthorized` — Token ausente o inválido**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 5. Módulo Users

**Prefijo:** `/users`  
**Autenticación requerida:** Sí — `Bearer Token` en todos los endpoints

---

### 5.1 Listar Todos los Usuarios

**`GET /users`**  
**Rol requerido:** `admin`

Retorna todos los documentos de la colección `users` sin paginación.

#### Respuestas

**`200 OK`**
```json
{
  "data": [
    {
      "_id": "64a1f3b2c8e4d20012345678",
      "username": "johndoe",
      "name": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "picture": "https://i.pravatar.cc/150?u=johndoe",
      "role": "user",
      "favorites": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**`401 Unauthorized`** · **`403 Forbidden`**

> **Área de mejora:** Este endpoint no tiene paginación. Con una base de usuarios grande puede generar respuestas de gran tamaño.

---

### 5.2 Obtener Usuario por ID

**`GET /users/:id`**  
**Rol requerido:** `admin`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del usuario |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "_id": "64a1f3b2c8e4d20012345678",
    "username": "johndoe",
    "name": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "picture": "https://i.pravatar.cc/150?u=johndoe",
    "role": "user",
    "favorites": ["64a1f3b2c8e4d20012345699"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**`404 Not Found`**
```json
{
  "statusCode": 404,
  "message": "User not found.",
  "error": "Not Found"
}
```

---

### 5.3 Eliminar Usuario

**`DELETE /users/:id`**  
**Rol requerido:** `admin`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del usuario a eliminar |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**`404 Not Found`**
```json
{
  "statusCode": 404,
  "message": "User not found.",
  "error": "Not Found"
}
```

---

### 5.4 Actualizar Usuario

**`PUT /users/:id`**  
**Rol requerido:** Propietario de la cuenta **o** `admin`

Un usuario solo puede actualizar su propio perfil. Un admin puede actualizar cualquier perfil. Todos los campos son opcionales (PartialType).

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del usuario a actualizar |

#### Request Body (todos los campos son opcionales)
```json
{
  "username": "johndoe_updated",
  "name": "Jonathan",
  "lastname": "Doe",
  "email": "jonathan@example.com",
  "password": "newpassword123"
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `username` | string | no | Mínimo 4 caracteres |
| `name` | string | no | No vacío |
| `lastname` | string | no | No vacío |
| `email` | string | no | Formato email válido |
| `password` | string | no | Mínimo 8 caracteres |

#### Respuestas

**`200 OK`** — Retorna el documento completo actualizado
```json
{
  "data": {
    "_id": "64a1f3b2c8e4d20012345678",
    "username": "johndoe_updated",
    "name": "Jonathan",
    "lastname": "Doe",
    "email": "jonathan@example.com",
    "picture": "https://i.pravatar.cc/150?u=johndoe",
    "role": "user",
    "favorites": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**`400 Bad Request` — Email o username ya en uso por otro usuario**
```json
{
  "statusCode": 400,
  "message": "Email already exists.",
  "error": "Bad Request"
}
```

**`403 Forbidden` — Intento de actualizar un usuario ajeno sin ser admin**
```json
{
  "statusCode": 403,
  "message": "You can only update your own user.",
  "error": "Forbidden"
}
```

**`404 Not Found`**

> **Área de mejora:** Si se envía `password` en el body, no se re-hashea con bcrypt. El campo se guarda en texto plano sobre el anterior hash.

---

### 5.5 Cambiar Rol de Usuario

**`PATCH /users/:id/role`**  
**Rol requerido:** `admin`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del usuario |

#### Request Body
```json
{
  "role": "admin"
}
```

| Campo | Tipo | Requerido | Valores válidos |
|---|---|---|---|
| `role` | enum | sí | `"user"` · `"admin"` |

#### Respuestas

**`200 OK`** — Retorna el documento actualizado
```json
{
  "data": {
    "_id": "64a1f3b2c8e4d20012345678",
    "username": "johndoe",
    "role": "admin"
  }
}
```

**`404 Not Found`** · **`401 Unauthorized`** · **`403 Forbidden`**

---

## 6. Módulo Posts

**Prefijo:** `/posts`  
**Autenticación requerida:** Sí — `Bearer Token` en todos los endpoints

### Comportamiento del filtro de toxicidad

Los endpoints de creación y edición de posts y comentarios llaman al microservicio FastAPI antes de guardar. Si el texto supera el umbral (`TOXICITY_THRESHOLD = 0.25`) en cualquier categoría, el endpoint retorna **`406 Not Acceptable`** con las categorías detectadas.

---

### 6.1 Crear Post

**`POST /posts`**

#### Request Body
```json
{
  "description": "Una tarde increíble en la montaña.",
  "image": "https://example.com/foto.jpg",
  "location": {
    "lat": 4.7109886,
    "lng": -74.072092
  },
  "country": "Colombia",
  "city": "Bogotá"
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `description` | string | sí | Mínimo 1 carácter, trimmed |
| `image` | string | sí | URL válida (`@IsUrl()`) |
| `location` | object | no | `{lat: number, lng: number}` |
| `country` | string | no | |
| `city` | string | no | |

#### Respuestas

**`201 Created`**
```json
{
  "data": {
    "_id": "64b2a1c3d5e6f70023456789",
    "description": "Una tarde increíble en la montaña.",
    "image": "https://example.com/foto.jpg",
    "location": { "lat": 4.7109886, "lng": -74.072092 },
    "country": "Colombia",
    "city": "Bogotá",
    "active": true,
    "manualReviewed": false,
    "user": "64a1f3b2c8e4d20012345678",
    "likes": [],
    "comments": [],
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**`406 Not Acceptable` — Contenido tóxico detectado**
```json
{
  "statusCode": 406,
  "message": ["toxicity", "insult"],
  "error": "Not Acceptable"
}
```

**`400 Bad Request`** · **`401 Unauthorized`**

---

### 6.2 Listar Posts Activos

**`GET /posts`**

Retorna posts con `active: true`, ordenados por `createdAt` descendente. Incluye flags `isFavorite` e `isLiked` calculados para el usuario autenticado.

#### Query Parameters
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | number | `1` | Página actual (≥ 1) |
| `limit` | number | `20` | Resultados por página (≥ 1) |

#### Respuestas

**`200 OK`**
```json
{
  "data": [
    {
      "_id": "64b2a1c3d5e6f70023456789",
      "description": "Una tarde increíble en la montaña.",
      "image": "https://example.com/foto.jpg",
      "active": true,
      "manualReviewed": false,
      "user": {
        "_id": "64a1f3b2c8e4d20012345678",
        "username": "johndoe",
        "name": "John",
        "lastname": "Doe",
        "picture": "https://i.pravatar.cc/150?u=johndoe"
      },
      "likes": [],
      "comments": [],
      "isFavorite": false,
      "isLiked": false,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "count": 45,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

---

### 6.3 Listar Todos los Posts (Admin)

**`GET /posts/all`**  
**Rol requerido:** `admin`

Igual que `GET /posts` pero sin filtro `active`. Retorna posts activos e inactivos.

#### Query Parameters
Idénticos a `GET /posts` (`page`, `limit`).

#### Respuestas
Idénticas a `GET /posts`.

---

### 6.4 Listar Posts Propios

**`GET /posts/owned`**

Retorna los posts del usuario autenticado (activos e inactivos), con paginación.

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas
Idénticas en estructura a `GET /posts`.

---

### 6.5 Listar Posts Favoritos

**`GET /posts/favorites`**

Retorna los posts marcados como favoritos por el usuario autenticado. Solo retorna posts con `active: true`.

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas

**`200 OK`** — Misma estructura que `GET /posts`

**`404 Not Found`** — Si el usuario autenticado no existe en la BD

---

### 6.6 Obtener Post por ID

**`GET /posts/:id`**

Retorna el post con sus comentarios populados (incluyendo datos del usuario de cada comentario). Si el post está inactivo y el solicitante no es el propietario, retorna `404`.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "_id": "64b2a1c3d5e6f70023456789",
    "description": "Una tarde increíble en la montaña.",
    "image": "https://example.com/foto.jpg",
    "active": true,
    "manualReviewed": false,
    "user": {
      "_id": "64a1f3b2c8e4d20012345678",
      "username": "johndoe",
      "name": "John",
      "lastname": "Doe",
      "picture": "https://i.pravatar.cc/150?u=johndoe"
    },
    "likes": [
      {
        "_id": "64a1f3b2c8e4d20012345679",
        "username": "janedoe",
        "name": "Jane",
        "lastname": "Doe",
        "picture": "https://i.pravatar.cc/150?u=janedoe"
      }
    ],
    "comments": [
      {
        "_id": "64c3b2a1d6f7e80034567890",
        "content": "Qué foto tan bonita!",
        "manualReviewed": false,
        "user": {
          "_id": "64a1f3b2c8e4d20012345679",
          "username": "janedoe",
          "name": "Jane",
          "lastname": "Doe",
          "picture": "https://i.pravatar.cc/150?u=janedoe"
        }
      }
    ],
    "isFavorite": true,
    "isLiked": false,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**`404 Not Found`**
```json
{
  "statusCode": 404,
  "message": "Post not found.",
  "error": "Not Found"
}
```

---

### 6.7 Actualizar Post

**`PUT /posts/:id`**  
**Restricción:** Solo el propietario del post

Pasa los campos modificados por el filtro de toxicidad antes de guardar. Al actualizarse, `manualReviewed` se resetea a `false`.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post |

#### Request Body (todos los campos son opcionales)
```json
{
  "description": "Descripción actualizada",
  "image": "https://example.com/nueva-foto.jpg",
  "country": "Colombia",
  "city": "Medellín"
}
```

#### Respuestas

**`200 OK`** — Retorna solo los campos actualizados
```json
{
  "data": {
    "description": "Descripción actualizada",
    "image": "https://example.com/nueva-foto.jpg",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

**`403 Forbidden`**
```json
{
  "statusCode": 403,
  "message": "Forbidden to update this post.",
  "error": "Forbidden"
}
```

**`406 Not Acceptable`** · **`404 Not Found`** · **`401 Unauthorized`**

> **Área de mejora:** La proyección de `findByIdAndUpdate` incluye `title` en el `select`, pero el modelo `Post` no tiene campo `title`. El campo será `undefined` en la respuesta.

---

### 6.8 Eliminar Post

**`DELETE /posts/:id`**  
**Restricción:** Solo el propietario del post

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post a eliminar |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

---

### 6.9 Toggle Activo/Inactivo de Post

**`PATCH /posts/:id/active`**  
**Restricción:** Solo el propietario del post

Cambia el campo `active` al valor contrario del actual.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post |

#### Respuestas

**`200 OK`** — Retorna solo el nuevo estado
```json
{
  "data": {
    "active": false
  }
}
```

**`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

---

### 6.10 Toggle Like / Dislike

**`PATCH /posts/:id/like`**

Si el usuario ya dio like, lo quita. Si no, lo agrega. No requiere body.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post |

#### Respuestas

**`200 OK`** — Retorna el array actualizado de likes (IDs)
```json
{
  "data": {
    "likes": ["64a1f3b2c8e4d20012345679"]
  }
}
```

**`404 Not Found`** · **`401 Unauthorized`**

---

### 6.11 Agregar Comentario

**`POST /posts/:id/comment`**

El contenido del comentario pasa por el filtro de toxicidad antes de guardarse.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post al que se comenta |

#### Request Body
```json
{
  "content": "Qué foto tan bonita!"
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `content` | string | sí | Mínimo 1 carácter, trimmed |

#### Respuestas

**`200 OK`** — Retorna el comentario creado
```json
{
  "data": {
    "_id": "64c3b2a1d6f7e80034567890",
    "content": "Qué foto tan bonita!",
    "manualReviewed": false,
    "post": "64b2a1c3d5e6f70023456789",
    "user": "64a1f3b2c8e4d20012345679",
    "createdAt": "2024-01-15T14:00:00.000Z",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

**`406 Not Acceptable`** · **`404 Not Found`** · **`401 Unauthorized`**

---

### 6.12 Eliminar Comentario

**`DELETE /posts/:id/comment`**  
**Restricción:** Solo el propietario del comentario

> **Nota:** El parámetro `:id` en esta ruta es el **ID del comentario**, no el ID del post. El nombre del parámetro en la ruta puede resultar confuso dado el prefijo `/posts`.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del **comentario** a eliminar |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

> **Área de mejora:** La ruta `DELETE /posts/:id/comment` es semánticamente ambigua. Una convención REST más clara sería `DELETE /posts/:postId/comment/:commentId`.

---

### 6.13 Toggle Favorito

**`PATCH /posts/:id/favorite`**

Agrega o quita el post de la lista de favoritos del usuario autenticado.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del post |

#### Respuestas

**`200 OK`** — Retorna el array actualizado de favoritos del usuario
```json
{
  "data": {
    "favorites": ["64b2a1c3d5e6f70023456789"]
  }
}
```

**`404 Not Found`** · **`401 Unauthorized`**

---

## 7. Módulo Events

**Prefijo:** `/events`  
**Autenticación requerida:** Sí — `Bearer Token` en todos los endpoints

### Comportamiento del filtro de toxicidad

Al crear o actualizar, tanto `title` como `description` se evalúan de forma independiente. Si cualquiera de los dos supera el umbral, retorna `406`.

---

### 7.1 Crear Evento

**`POST /events`**

#### Request Body
```json
{
  "title": "Meetup de Desarrolladores",
  "description": "Encuentro mensual de la comunidad tech.",
  "date": "2024-03-15T00:00:00.000Z",
  "schedule": {
    "startTime": "14:00",
    "endTime": "18:00"
  },
  "location": {
    "lat": 4.7109886,
    "lng": -74.072092
  },
  "country": "Colombia",
  "city": "Bogotá",
  "address": "Carrera 7 #32-16",
  "capacity": 50
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `title` | string | sí | Mínimo 1 carácter, trimmed |
| `description` | string | sí | Mínimo 1 carácter, trimmed |
| `date` | Date (ISO 8601) | sí | |
| `schedule` | object | sí | |
| `schedule.startTime` | string | sí | Ej: `"14:00"` |
| `schedule.endTime` | string | no | Ej: `"18:00"` |
| `location` | object | no | `{lat: number, lng: number}` |
| `country` | string | no | |
| `city` | string | no | |
| `address` | string | no | |
| `capacity` | integer | no | ≥ 1 |

#### Respuestas

**`201 Created`**
```json
{
  "data": {
    "_id": "64d4c3b2e7f8a90045678901",
    "title": "Meetup de Desarrolladores",
    "description": "Encuentro mensual de la comunidad tech.",
    "date": "2024-03-15T00:00:00.000Z",
    "schedule": { "startTime": "14:00", "endTime": "18:00" },
    "location": { "lat": 4.7109886, "lng": -74.072092 },
    "country": "Colombia",
    "city": "Bogotá",
    "address": "Carrera 7 #32-16",
    "active": true,
    "capacity": 50,
    "user": "64a1f3b2c8e4d20012345678",
    "attendees": [],
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

**`406 Not Acceptable`** · **`400 Bad Request`** · **`401 Unauthorized`**

---

### 7.2 Listar Eventos Activos

**`GET /events`**

Retorna eventos con `active: true`, ordenados por `date` ascendente (próximos primero). Soporta filtros de búsqueda y rango de fechas. Incluye flag `isAttending`.

#### Query Parameters
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | number | `1` | |
| `limit` | number | `20` | |
| `search` | string | — | Busca en `title` y `description` (insensible a mayúsculas) |
| `dateFrom` | Date (ISO 8601) | — | Fecha mínima del evento |
| `dateTo` | Date (ISO 8601) | — | Fecha máxima del evento |

#### Respuestas

**`200 OK`**
```json
{
  "data": [
    {
      "_id": "64d4c3b2e7f8a90045678901",
      "title": "Meetup de Desarrolladores",
      "description": "Encuentro mensual de la comunidad tech.",
      "date": "2024-03-15T00:00:00.000Z",
      "schedule": { "startTime": "14:00", "endTime": "18:00" },
      "active": true,
      "capacity": 50,
      "user": {
        "_id": "64a1f3b2c8e4d20012345678",
        "username": "johndoe",
        "name": "John",
        "lastname": "Doe",
        "picture": "https://i.pravatar.cc/150?u=johndoe"
      },
      "attendees": [],
      "isAttending": false,
      "createdAt": "2024-01-15T15:00:00.000Z",
      "updatedAt": "2024-01-15T15:00:00.000Z"
    }
  ],
  "pagination": {
    "count": 12,
    "page": 1,
    "pages": 1,
    "limit": 20
  }
}
```

---

### 7.3 Listar Todos los Eventos (Admin)

**`GET /events/all`**  
**Rol requerido:** `admin`

Acepta los mismos query parameters que `GET /events`. La diferencia está en que el filtro interno no filtra por `active`.

> **Área de mejora:** Al revisar el servicio, `findAll` siempre agrega `active: true` al query. Por lo tanto, este endpoint de admin **también filtra eventos inactivos**, igual que el endpoint público.

---

### 7.4 Listar Próximos Eventos

**`GET /events/upcoming`**

Retorna eventos activos cuya `date >= now`, ordenados por fecha ascendente.

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas
Misma estructura que `GET /events`, pero sin el flag `isAttending` (los attendees no se populan en este endpoint).

---

### 7.5 Listar Eventos Propios

**`GET /events/owned`**

Retorna los eventos creados por el usuario autenticado con `active: true`.

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas
Misma estructura que `GET /events`. Sin flag `isAttending`.

---

### 7.6 Listar Eventos a los que Asiste

**`GET /events/attending`**

Retorna los eventos activos en los que el usuario autenticado figura en `attendees`.

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas
Misma estructura que `GET /events`. Incluye flag `isAttending: true` en todos los resultados.

---

### 7.7 Listar Eventos por Usuario

**`GET /events/user/:userId`**

Retorna los eventos activos creados por un usuario específico.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `userId` | ObjectId | ID del usuario |

#### Query Parameters
| Parámetro | Tipo | Default |
|---|---|---|
| `page` | number | `1` |
| `limit` | number | `20` |

#### Respuestas
Misma estructura que `GET /events`. Sin flag `isAttending`.

---

### 7.8 Obtener Evento por ID

**`GET /events/:id`**

Solo retorna el evento si `active: true`.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del evento |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "_id": "64d4c3b2e7f8a90045678901",
    "title": "Meetup de Desarrolladores",
    "description": "Encuentro mensual de la comunidad tech.",
    "date": "2024-03-15T00:00:00.000Z",
    "schedule": { "startTime": "14:00", "endTime": "18:00" },
    "location": { "lat": 4.7109886, "lng": -74.072092 },
    "country": "Colombia",
    "city": "Bogotá",
    "address": "Carrera 7 #32-16",
    "active": true,
    "capacity": 50,
    "user": {
      "_id": "64a1f3b2c8e4d20012345678",
      "username": "johndoe",
      "name": "John",
      "lastname": "Doe",
      "picture": "https://i.pravatar.cc/150?u=johndoe"
    },
    "attendees": [],
    "isAttending": false,
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

**`404 Not Found`**
```json
{
  "statusCode": 404,
  "message": "Event not found.",
  "error": "Not Found"
}
```

---

### 7.9 Actualizar Evento

**`PUT /events/:id`**  
**Restricción:** Solo el propietario del evento

Los campos `title` y `description` (si se envían) pasan por el filtro de toxicidad.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del evento |

#### Request Body (todos los campos son opcionales)
```json
{
  "title": "Meetup de Desarrolladores — Edición Especial",
  "date": "2024-03-20T00:00:00.000Z",
  "capacity": 100
}
```

#### Respuestas

**`200 OK`** — Retorna campos seleccionados
```json
{
  "data": {
    "title": "Meetup de Desarrolladores — Edición Especial",
    "description": "Encuentro mensual de la comunidad tech.",
    "date": "2024-03-20T00:00:00.000Z",
    "schedule": { "startTime": "14:00", "endTime": "18:00" },
    "updatedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

**`406 Not Acceptable`** · **`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

---

### 7.10 Eliminar Evento

**`DELETE /events/:id`**  
**Restricción:** Solo el propietario del evento

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del evento |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

---

### 7.11 Toggle Activo/Inactivo de Evento

**`PATCH /events/:id/active`**  
**Restricción:** Solo el propietario del evento

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del evento |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "active": false
  }
}
```

**`403 Forbidden`** · **`404 Not Found`** · **`401 Unauthorized`**

> **Área de mejora:** La comparación de `event.user !== userId` en el servicio compara un ObjectId contra un ObjectId usando `!==` (referencia), no `.equals()`. Esto puede provocar que la validación de propietario **siempre falle** y retorne `403`, incluso para el propietario legítimo.

---

### 7.12 Toggle Asistencia a Evento

**`PATCH /events/:id/attendance`**

Agrega o quita al usuario autenticado de la lista `attendees`.

**Condiciones de rechazo:**
- El evento ya pasó (`event.date < now`) → `403`
- El evento alcanzó su `capacity` (al intentar agregar) → `403`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del evento |

#### Respuestas

**`200 OK`** — Retorna el estado actualizado de attendees y capacity
```json
{
  "data": {
    "attendees": ["64a1f3b2c8e4d20012345679"],
    "capacity": 50
  }
}
```

**`403 Forbidden` — Evento pasado**
```json
{
  "statusCode": 403,
  "message": "Cannot mark attendance to a past event.",
  "error": "Forbidden"
}
```

**`403 Forbidden` — Capacidad llena**
```json
{
  "statusCode": 403,
  "message": "This event has reached its capacity.",
  "error": "Forbidden"
}
```

**`404 Not Found`** · **`401 Unauthorized`**

---

## 8. Módulo Toxicity Reports

**Prefijo:** `/toxicity-reports`  
**Autenticación requerida:** Sí — `Bearer Token` en todos los endpoints

### Flujo de moderación manual

```
Usuario reporta elemento → status: "pending"
       ↓
Admin revisa en GET /toxicity-reports/monitor
       ↓
Admin decide con PATCH /toxicity-reports/:id/decide
       ├── ACCEPTED → Elimina el post/comentario + marca manualReviewed: true
       └── REJECTED → Solo cierra el reporte
```

---

### 8.1 Crear Reporte de Toxicidad

**`POST /toxicity-reports`**

Cualquier usuario autenticado puede reportar un post o comentario. Si ya existe un reporte en estado `"pending"` para el mismo elemento, retorna `409`.

#### Request Body
```json
{
  "tags": ["toxicity", "insult"],
  "type": "post",
  "reportedElementId": "64b2a1c3d5e6f70023456789"
}
```

| Campo | Tipo | Requerido | Restricciones |
|---|---|---|---|
| `tags` | string[] | sí | Array de etiquetas de toxicidad |
| `type` | enum | sí | `"post"` · `"comment"` |
| `reportedElementId` | string (ObjectId) | sí | ID del post o comentario reportado |

#### Respuestas

**`201 Created`**
```json
{
  "data": {
    "_id": "64e5d4c3f8g9h00056789012",
    "content": "Una tarde increíble en la montaña.",
    "tags": ["toxicity", "insult"],
    "reportedElementId": "64b2a1c3d5e6f70023456789",
    "type": "post",
    "status": "pending",
    "user": "64a1f3b2c8e4d20012345678",
    "reviewer": null,
    "revisionDate": null,
    "createdAt": "2024-01-15T17:00:00.000Z",
    "updatedAt": "2024-01-15T17:00:00.000Z"
  }
}
```

**`409 Conflict` — Reporte pendiente ya existente**
```json
{
  "statusCode": 409,
  "message": "Report already exists",
  "error": "Conflict"
}
```

**`404 Not Found` — Post o comentario no encontrado**
```json
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

**`401 Unauthorized`**

---

### 8.2 Historial de Reportes

**`GET /toxicity-reports/history`**  
**Rol requerido:** `admin`

Retorna todos los reportes (cualquier status), con paginación y filtros opcionales.

#### Query Parameters
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | number | `1` | |
| `limit` | number | `20` | |
| `type` | enum | — | Filtrar por `"post"` o `"comment"` |
| `order` | enum | `"desc"` | Orden por `createdAt`: `"asc"` · `"desc"` |

#### Respuestas

**`200 OK`**
```json
{
  "data": {
    "reports": [
      {
        "_id": "64e5d4c3f8g9h00056789012",
        "content": "Texto del elemento reportado",
        "tags": ["toxicity"],
        "reportedElementId": "64b2a1c3d5e6f70023456789",
        "type": "post",
        "status": "accepted",
        "user": {
          "_id": "64a1f3b2c8e4d20012345678",
          "username": "johndoe",
          "name": "John",
          "lastname": "Doe",
          "picture": "https://i.pravatar.cc/150?u=johndoe"
        },
        "reviewer": {
          "_id": "64a1f3b2c8e4d20012345670",
          "username": "adminuser",
          "name": "Admin",
          "lastname": "User",
          "picture": "https://i.pravatar.cc/150?u=adminuser"
        },
        "revisionDate": "2024-01-16T09:00:00.000Z",
        "createdAt": "2024-01-15T17:00:00.000Z",
        "updatedAt": "2024-01-16T09:00:00.000Z"
      }
    ],
    "pagination": {
      "count": 5,
      "page": 1,
      "pages": 1,
      "limit": 20
    }
  }
}
```

---

### 8.3 Monitor de Reportes Pendientes

**`GET /toxicity-reports/monitor`**  
**Rol requerido:** `admin`

Igual que `/history` pero filtra solo reportes con `status: "pending"`. El campo `reviewer` no se popula (es `null` en pendientes).

#### Query Parameters
Idénticos a `GET /toxicity-reports/history`.

#### Respuestas

**`200 OK`** — Misma estructura que `/history` pero solo con reportes pendientes.

---

### 8.4 Obtener Reporte por ID

**`GET /toxicity-reports/:id`**  
**Rol requerido:** `admin`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del reporte |

#### Respuestas

**`200 OK`** — Mismo formato de objeto que aparece en la lista de `/history`.

**`404 Not Found`**
```json
{
  "statusCode": 404,
  "message": "Report not found",
  "error": "Not Found"
}
```

---

### 8.5 Decidir sobre un Reporte

**`PATCH /toxicity-reports/:id/decide`**  
**Rol requerido:** `admin`

Toma una acción sobre un reporte pendiente. Si el status no es `"pending"`, retorna `409`.

**Consecuencias según la decisión:**
- `"accepted"`: Elimina el post/comentario de la BD. Marca `manualReviewed: true` en el elemento (si aún existe).
- `"rejected"`: Solo actualiza el estado del reporte. El post/comentario no se toca.

En ambos casos: asigna `reviewer` al admin que decide y establece `revisionDate`.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | ObjectId | ID del reporte |

#### Request Body
```json
{
  "status": "accepted"
}
```

| Campo | Tipo | Requerido | Valores válidos |
|---|---|---|---|
| `status` | enum | sí | `"accepted"` · `"rejected"` |

#### Respuestas

**`200 OK`** — Retorna el reporte actualizado
```json
{
  "data": {
    "_id": "64e5d4c3f8g9h00056789012",
    "content": "Texto del elemento reportado",
    "tags": ["toxicity"],
    "reportedElementId": "64b2a1c3d5e6f70023456789",
    "type": "post",
    "status": "accepted",
    "user": "64a1f3b2c8e4d20012345678",
    "reviewer": "64a1f3b2c8e4d20012345670",
    "revisionDate": "2024-01-16T09:00:00.000Z",
    "createdAt": "2024-01-15T17:00:00.000Z",
    "updatedAt": "2024-01-16T09:00:00.000Z"
  }
}
```

**`409 Conflict` — Reporte ya decidido**
```json
{
  "statusCode": 409,
  "message": "Report already decided",
  "error": "Conflict"
}
```

**`404 Not Found`** · **`401 Unauthorized`** · **`403 Forbidden`**

---

## 9. Microservicio de Moderación (FastAPI)

**URL Base:** `http://localhost:8000`  
**Autenticación requerida:** Ninguna (servicio interno, no expuesto públicamente)  
**Tecnología:** FastAPI + PyTorch + modelo [Detoxify Multilingual](https://github.com/unitaryai/detoxify) (`multilingual_debiased-0b549669.ckpt`)

Este microservicio es consumido internamente por la API NestJS. No está diseñado para ser llamado directamente por clientes externos.

---

### 9.1 Moderar Contenido

**`POST /moderate`**

Analiza un texto y retorna scores de toxicidad entre `0.0` y `1.0` para cada categoría. La API NestJS considera el texto tóxico si cualquier score supera `TOXICITY_THRESHOLD` (default `0.25`).

#### Request Body
```json
{
  "content": "El texto a evaluar va aquí."
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `content` | string | sí |

#### Respuestas

**`200 OK`**
```json
{
  "results": {
    "toxicity": 0.0234,
    "severe_toxicity": 0.0012,
    "obscene": 0.0087,
    "identity_attack": 0.0043,
    "insult": 0.0156,
    "threat": 0.0021,
    "sexual_explicit": 0.0009
  }
}
```

**Categorías de evaluación:**

| Categoría | Descripción |
|---|---|
| `toxicity` | Toxicidad general |
| `severe_toxicity` | Toxicidad severa |
| `obscene` | Contenido obsceno |
| `identity_attack` | Ataque a identidad (raza, género, religión, etc.) |
| `insult` | Insulto |
| `threat` | Amenaza |
| `sexual_explicit` | Contenido sexual explícito |

---

## 10. Códigos de Error Globales

| Código HTTP | Significado | Causa común |
|---|---|---|
| `400 Bad Request` | Body inválido o campo duplicado | Validación de DTO fallida, email/username ya existe |
| `401 Unauthorized` | Token ausente, expirado o inválido | Falta el header `Authorization` |
| `403 Forbidden` | Rol insuficiente o recurso ajeno | Intento de acción sobre recurso de otro usuario sin ser admin |
| `404 Not Found` | Recurso no existe | ID no encontrado en BD, post inactivo accedido por no-propietario |
| `406 Not Acceptable` | Contenido tóxico detectado | Score del microservicio supera el umbral en cualquier categoría |
| `409 Conflict` | Estado inconsistente | Reporte duplicado, reporte ya decidido |
| `422 Unprocessable Entity` | Campo no permitido en body | `forbidNonWhitelisted: true` activo globalmente |

### Formato de error estándar (NestJS)
```json
{
  "statusCode": 404,
  "message": "User not found.",
  "error": "Not Found"
}
```
