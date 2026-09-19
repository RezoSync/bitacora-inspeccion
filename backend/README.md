# A4 - Bitacora de Inspeccion (backend)

## Inicio local

1. Copia `.env.example` como `.env` y configura MySQL y `JWT_SECRET`.
2. Ejecuta `database/migration.sql` en MySQL.
3. Instala y compila: `npm install` y `npm run build`.
4. Inicia en desarrollo: `npm run dev`.

La API queda disponible en `http://localhost:3000`. El endpoint `GET /api/health` no requiere autenticacion.

## Rutas

- `POST /api/auth/register`
- `POST /api/auth/login`
- Rutas de visitas bajo `/api/visits`, protegidas con `Authorization: Bearer <token>`.
- Para evidencia usa `multipart/form-data` con el campo `evidence`.
