# Lab 10 API (Node + Vercel)

API REST para exponer recomendaciones de películas (Laboratorio Semana 10).

## Objetivo

Exponer los resultados generados en Spark mediante dos endpoints:

- `GET /recommendations`
- `GET /recommendations/{user_id}`

La API usa un archivo `data/recommendations.json` en formato anidado por usuario.

## Estructura del proyecto

```text
lab10-api-node/
  api/
    recommendations/
      index.js          # GET /recommendations
      [user_id].js      # GET /recommendations/{user_id}
  data/
    recommendations.json
  scripts/
    build-recommendations-data.js
  vercel.json           # Rewrites para rutas sin /api
```

## Formato esperado en `data/recommendations.json`

Cada usuario debe tener esta estructura:

```json
[
  {
    "user_id": 123,
    "cluster": 2,
    "recommendations": [
      {
        "movie_id": 10,
        "movie_title": "GoldenEye (1995)",
        "score": 4.8
      }
    ]
  }
]
```

## Generar el JSON final desde la salida Spark

Convierte `out/recs_k=.../data.jsonl` al formato de la API:

```bash
node scripts/build-recommendations-data.js --input ../out/recs_k=3/data.jsonl --output data/recommendations.json
```

Notas:

- Cambia `recs_k=3` por el K que quieras publicar (recomendado: el mejor K de tu evaluación).
- El script agrupa por usuario y mapea:
  - `userId` -> `user_id`
  - `movieId` -> `movie_id`
  - `title` -> `movie_title`
  - `avg_rating` -> `score`

## Despliegue en Vercel (Dashboard web)

1. Sube el repo a GitHub.
2. En Vercel: **Add New Project** -> importa el repo.
3. Configura **Root Directory** = `lab10-api-node`.
4. Deploy.

Gracias a `vercel.json`, las rutas públicas quedan así:

- `/recommendations`
- `/recommendations/{user_id}`

## Endpoints y ejemplos

### 1) GET `/recommendations`

Devuelve todos los usuarios con sus recomendaciones.

**Respuesta 200 (ejemplo):**

```json
[
  {
    "user_id": 1,
    "cluster": 0,
    "recommendations": [
      {
        "movie_id": 1046,
        "movie_title": "Beautiful Thing (1996)",
        "score": 4.888889
      }
    ]
  }
]
```

### 2) GET `/recommendations/{user_id}`

Devuelve un usuario específico.

**Respuesta 200 (ejemplo para `/recommendations/1`):**

```json
{
  "user_id": 1,
  "cluster": 0,
  "recommendations": [
    {
      "movie_id": 1046,
      "movie_title": "Beautiful Thing (1996)",
      "score": 4.888889
    }
  ]
}
```

**Respuesta 404 (usuario no encontrado):**

```json
{
  "error": "User not found"
}
```

## Manejo de errores y códigos de estado

- `200`: solicitud correcta.
- `404`: usuario no encontrado (`/recommendations/{user_id}`).
- `405`: método HTTP no permitido (por ejemplo `POST`).
- `500`: error interno (JSON faltante/corrupto, error de lectura, etc.).

Ejemplo 500:

```json
{
  "error": "Internal server error",
  "detail": "data/recommendations.json must be an array"
}
```

## Checklist rápido antes de entregar

1. `data/recommendations.json` existe y tiene datos.
2. `/recommendations` responde `200`.
3. `/recommendations/1` (u otro válido) responde `200`.
4. `/recommendations/999999` responde `404`.
5. En el README están documentados endpoints, formato y errores.
