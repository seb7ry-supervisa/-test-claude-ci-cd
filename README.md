# Simuladores API

Servicio centralizado de endpoints simulados de clientes terceros, usado durante desarrollo cuando el servicio real del tercero no está disponible.

## Estructura

```
src/
  clients/
    <nombreCliente>/
      routes.js      ← todos los endpoints simulados de ese cliente
  app.js              ← registro central: monta cada cliente en su path
server.js             ← arranca el servidor HTTP
```

## Agregar un cliente nuevo

El estándar completo (formato de respuesta, logging, checklist de PR) está en [`SPEC.md`](./SPEC.md) — léelo antes de agregar un cliente nuevo.

## Correr localmente

```bash
npm install
npm run dev
```

O con Docker:

```bash
docker compose up --build
```

El servicio queda disponible en `http://localhost:4000`.

## Flujo de ramas

- `feature/*` → PR a `develop`: valida que el código no tenga errores de sintaxis.
- `develop`: además publica una imagen Docker con tag `develop` (build de prueba).
- `master`: publica la imagen `master`, la que consume todo el equipo. El paso de publicación es manual (se dispara desde Bitbucket luego de aprobar el PR) mientras se define dónde y cómo se despliega de forma automática.

## Pendiente por definir

- Registro Docker donde se publican las imágenes (`DOCKER_REGISTRY`, `DOCKER_USERNAME`, `DOCKER_PASSWORD` como variables de repositorio en Bitbucket).
- Servidor donde correrá la instancia compartida que consume todo el equipo (¿el servidor de oficina vía VPN existente?).
- Paso de despliegue automático (pull + restart del contenedor) una vez definido lo anterior.
