# WapaPizzasParty

Aplicacion web en desarrollo para la gestion simple de una pizzeria y servicio de pizza party.

Hoy el proyecto ya permite mostrar pizzas, armar un carrito, registrar ventas y consultar historial por fecha. La siguiente etapa del trabajo esta orientada a ordenar la base tecnica para que el producto pueda crecer con menos deuda y una estructura mas clara.

## Estado del proyecto

- Estado actual: prototipo funcional en evolucion.
- Objetivo inmediato: refactorizar estructura, datos y documentacion.
- Plan de trabajo: ver `REFACTOR_PLAN_WAPAPIZZASPARTY.md`.

## Funcionalidades actuales

- Visualizacion del menu de pizzas.
- Carrito de compra con actualizacion de cantidades.
- Confirmacion de venta desde frontend.
- Persistencia basica de pizzas y ventas en archivos JSON.
- Historial de ventas por fecha.
- Paginas institucionales del negocio.

## Stack actual

- Frontend: React, Vite, React Router, Tailwind, CSS Modules, Framer Motion, SweetAlert2.
- Backend: FastAPI.
- Persistencia actual: archivos JSON.

## Estructura general

```text
Project_1/
|- backend/
|  |- app/
|  |  |- main.py
|  |  |- pizzas.json
|  |  |- ventas.json
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- store/
|- REFACTOR_PLAN_WAPAPIZZASPARTY.md
|- README.md
```

## Como correr el proyecto

### Backend

Desde la carpeta raiz:

```bash
cd backend
..\venv\Scripts\uvicorn app.main:app --reload
```

El backend queda disponible en `http://127.0.0.1:8000`.

### Frontend

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

### Inicio rapido en Windows

Desde la raiz del proyecto podes levantar ambos servicios con:

```powershell
.\scripts\start-dev.ps1
```

Eso abre dos ventanas nuevas de PowerShell:

- una para FastAPI,
- y otra para Vite.

Si solo queres ver los comandos sin abrir ventanas:

```powershell
.\scripts\start-dev.ps1 -SameWindow
```

## Flujo actual de datos

- El frontend consulta pizzas en `GET /pizzas`.
- El frontend registra ventas en `POST /ventas/`.
- El historial usa `GET /ventas/{fecha}`.
- Los datos se leen y escriben en `backend/app/pizzas.json` y `backend/app/ventas.json`.

## Problemas conocidos

- El repositorio todavia necesita limpieza de archivos no versionables y estructura Git.
- El frontend contiene archivos heredados de una plantilla.
- La persistencia en JSON sirve para prototipo, pero no es la solucion final.
- Falta validacion formal de datos en varias partes del flujo.

## Siguiente etapa

Las proximas mejoras estan orientadas a:

- limpiar el repositorio,
- mejorar documentacion,
- estandarizar contratos entre frontend y backend,
- y separar mejor la logica del negocio.

## Autor

Proyecto impulsado por Ezequiel Bellino para WapaPizzasParty.
