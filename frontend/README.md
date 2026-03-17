# Frontend WapaPizzasParty

Frontend en React para la experiencia de venta y consulta basica de WapaPizzasParty.

## Objetivo actual

Este frontend cubre el flujo visible del negocio:

- mostrar el menu de pizzas,
- permitir agregar productos al carrito,
- confirmar ventas,
- y consultar historial por fecha.

Todavia esta en etapa de consolidacion y forma parte del plan de refactor general del proyecto.

## Stack

- React
- Vite
- React Router
- Tailwind CSS
- CSS Modules
- Framer Motion
- SweetAlert2

## Estructura principal

```text
frontend/
|- src/
|  |- api/
|  |- components/
|  |- pages/
|  |- store/
|  |- styles/
|- public/
|- package.json
|- vite.config.ts
```

## Scripts disponibles

```bash
npm run dev
npm run build
```

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Levantar entorno de desarrollo:

```bash
npm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

## Dependencia del backend

Este frontend espera que el backend de FastAPI este corriendo en `http://127.0.0.1:8000`.

Endpoints usados hoy:

- `GET /pizzas`
- `POST /ventas/`
- `GET /ventas/{fecha}`

## Deuda tecnica actual

- Conviven estilos de distinta estrategia y falta unificar criterios.
- La persistencia sigue basada en JSON de backend.
- Faltan estados mas completos para venta, carrito e historial.
- El siguiente paso es reforzar contratos y validaciones del dominio.

## Proximo foco

- reforzar contratos entre frontend y backend,
- ordenar componentes y estilos,
- y sumar mejoras reales de gestion sobre una base mas limpia.
