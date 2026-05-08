# Lab 10 API (Node.js + Vercel) - Version Final

Autores: Pablo Guzman Alarcon, Juan Calderon

API REST para exponer recomendaciones de peliculas generadas en el laboratorio (Spark + clustering/recomendacion), desplegada en Vercel.

## URL de produccion

- Base URL: `https://lab-10-juanc773s-projects.vercel.app`
- Endpoint lista: `GET /recommendations`
- Endpoint por usuario: `GET /recommendations/{user_id}`

## Objetivo del servicio

Publicar recomendaciones de peliculas por usuario a partir de `data/recommendations.json`, con respuestas JSON y manejo de errores para consumo desde Postman.

## Stack y arquitectura

- Runtime: Node.js (Serverless Functions en Vercel)
- Ruteo: `vercel.json` (rewrites sin prefijo `/api`)
- Fuente de datos: `data/recommendations.json`
- Modulos clave:
  - `api/recommendations/index.js` -> lista completa
  - `api/recommendations/[user_id].js` -> usuario especifico
  - `lib/recommendations.js` -> normalizacion, cache y utilidades

## Estructura del proyecto

```text
lab10-api-node/
  api/
    recommendations/
      index.js            # GET /recommendations
      [user_id].js        # GET /recommendations/{user_id}
  data/
    recommendations.json  # dataset final para la API
  lib/
    recommendations.js    # normalizacion y cache en memoria
  scripts/
    build-recommendations-data.js
  package.json
  vercel.json
```

## Formato del dataset

El archivo `data/recommendations.json` debe ser un arreglo de usuarios:

```json
[
  {
    "user_id": 1,
    "cluster": 0,
    "recommendations": [
      {
        "movie_id": 1046,
        "movie_title": "Beautiful Thing (1996)",
        "score": 4.8889
      }
    ]
  }
]
```

Mapeo esperado desde salida de Spark:

- `userId` -> `user_id`
- `movieId` -> `movie_id`
- `title` -> `movie_title`
- `avg_rating` -> `score`

## Generacion del JSON final

Desde la carpeta `lab10-api-node`, ejecutar:

```bash
node scripts/build-recommendations-data.js --input ../out/recs_k=3/data.jsonl --output data/recommendations.json
```

Nota: `recs_k=3` es solo ejemplo; usar el K final elegido en la evaluacion.

## Como probar la API desplegada (Vercel)

El despliegue ya esta publico. Base URL de produccion:

`https://lab-10-juanc773s-projects.vercel.app`

En Postman (o pegando en el navegador para GET), usar estas URLs completas:

| Caso | URL | Resultado esperado |
|------|-----|--------------------|
| Lista de todos los usuarios | `GET https://lab-10-juanc773s-projects.vercel.app/recommendations` | `200 OK`, JSON en forma de **array** |
| Usuario existente (ejemplo `user_id` 1) | `GET https://lab-10-juanc773s-projects.vercel.app/recommendations/1` | `200 OK`, JSON **objeto** con `user_id`, `cluster`, `recommendations` |
| Usuario inexistente | `GET https://lab-10-juanc773s-projects.vercel.app/recommendations/999999` | `404 Not Found`, body `{"error":"User not found"}` |

Pasos rapidos en Postman: metodo **GET**, pegar la URL completa de la tabla, **Send**, revisar el codigo de estado arriba a la derecha y el cuerpo en **Body**.

## Ejecucion local (opcional, solo desarrollo)

Si necesitas corregir el proyecto antes de otro deploy:

```bash
npm install
npx vercel dev
```

Las mismas rutas existen en local bajo el puerto que indique la CLI (por defecto suele ser `http://localhost:3000/...`), pero **la entrega y la revision deben hacerse contra la URL de Vercel** de arriba.

## Despliegue en Vercel

1. Subir repositorio a GitHub.
2. En Vercel: **Add New Project** e importar el repo.
3. Configurar **Root Directory** = `lab10-api-node`.
4. Deploy.

Con `vercel.json`, las rutas publicas quedan:

- `/recommendations`
- `/recommendations/{user_id}`

## Endpoints

En produccion, anteponer siempre la base: `https://lab-10-juanc773s-projects.vercel.app`

### GET `/recommendations`

URL completa de ejemplo: `https://lab-10-juanc773s-projects.vercel.app/recommendations`

Retorna la lista completa de usuarios con recomendaciones.

- Status esperado: `200 OK`
- Content-Type: `application/json; charset=utf-8`

Ejemplo de cuerpo:

```json
[
  {
    "user_id": 1,
    "cluster": 0,
    "recommendations": [
      {
        "movie_id": 1046,
        "movie_title": "Beautiful Thing (1996)",
        "score": 4.8889
      }
    ]
  }
]
```

### GET `/recommendations/{user_id}`

URL completa de ejemplo (usuario 1): `https://lab-10-juanc773s-projects.vercel.app/recommendations/1`

URL de ejemplo para error 404: `https://lab-10-juanc773s-projects.vercel.app/recommendations/999999`

Retorna un usuario especifico.

- `200 OK` si el usuario existe
- `404 Not Found` si el usuario no existe

Ejemplo `200`:

```json
{
  "user_id": 1,
  "cluster": 0,
  "recommendations": [
    {
      "movie_id": 1046,
      "movie_title": "Beautiful Thing (1996)",
      "score": 4.8889
    }
  ]
}
```

Ejemplo `404`:

```json
{
  "error": "User not found"
}
```

## Manejo de errores y codigos de estado

- `200`: solicitud correcta.
- `404`: usuario no encontrado.
- `405`: metodo HTTP no permitido (por ejemplo, `POST` sobre endpoints GET).
- `500`: error interno (dataset invalido, error de lectura o excepcion no controlada).

Ejemplo `500`:

```json
{
  "error": "Internal server error",
  "detail": "data/recommendations.json must be an array"
}
```

## Validacion realizada (Postman, contra Vercel)

Pruebas hechas en la URL publica de produccion:

1. `GET https://lab-10-juanc773s-projects.vercel.app/recommendations` -> `200 OK` (lista de usuarios).
2. `GET https://lab-10-juanc773s-projects.vercel.app/recommendations/1` -> `200 OK` (usuario valido).
3. `GET https://lab-10-juanc773s-projects.vercel.app/recommendations/999999` -> `404 Not Found` con `{ "error": "User not found" }`.

Nota sobre `500`: en produccion estable no se fuerza solo con la URL. Para demostrar `500` se puede usar el proyecto en local con `data/recommendations.json` invalido temporalmente (por ejemplo `{}` en vez de `[]`) y `npx vercel dev`.

