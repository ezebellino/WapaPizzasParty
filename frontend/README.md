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
- Parte de la estructura proviene de una plantilla inicial.
- Las llamadas a la API todavia estan acopladas a la capa de store.
- Faltan estados de error y carga mas consistentes.

## Proximo foco

- mover llamadas HTTP a una capa dedicada,
- ordenar componentes y estilos,
- y alinear mejor este frontend con el dominio real de gestion de la pizzeria.
