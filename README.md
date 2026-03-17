# WapaPizzaParty

Aplicacion en desarrollo para la gestion simple de una pizzeria y servicio de pizza party.

Hoy el proyecto ya permite mostrar pizzas, armar un carrito, registrar ventas y consultar historial por fecha. La siguiente etapa del trabajo esta orientada a ordenar la base tecnica para que el producto pueda crecer con menos deuda y una estructura mas clara.

## Estado del proyecto

- Estado actual: prototipo funcional en evolucion.
- Objetivo inmediato: refactorizar estructura, datos y documentacion.
- Plan de trabajo actual: ver `PLAN_WAPAPIZZAPARTY_LOCAL.md`.

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
|- PLAN_WAPAPIZZAPARTY_LOCAL.md
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

### Variables de entorno del backend

Puedes crear `backend/.env` tomando como base `backend/.env.example`.

Configuracion recomendada:

```env
WAPA_AUTH_SECRET=una-clave-segura
WHATSAPP_MODE=mock
WHATSAPP_PROVIDER=mock
```

Para habilitar envio real con Twilio WhatsApp:

```env
WHATSAPP_MODE=live
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_STATUS_CALLBACK_URL=https://tu-dominio.com/webhooks/twilio/whatsapp
WAPA_BUSINESS_PHONE=2245509530
WAPA_INSTAGRAM=https://www.instagram.com/wapapizzaparty
WAPA_FACEBOOK=https://www.facebook.com/SoleMoranWapaPizzaParty
```

En modo `mock`, la aplicacion prepara y registra el mensaje sin enviarlo.
En modo `live`, el backend intenta enviarlo por la API oficial de Twilio.

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
- Si el pedido tiene aviso por WhatsApp, el backend genera el mensaje segun el estado y lo envia o simula segun la configuracion.

## Problemas conocidos

- El repositorio todavia necesita limpieza de archivos no versionables y estructura Git.
- El frontend contiene archivos heredados de una plantilla.
- La persistencia en JSON sirve para prototipo, pero no es la solucion final.
- Falta validacion formal de datos en varias partes del flujo.
- Para produccion en WhatsApp hacen falta credenciales reales, sender aprobado y templates aprobados segun las reglas del proveedor.

## Siguiente etapa

Las proximas mejoras estan orientadas a:

- limpiar el repositorio,
- mejorar documentacion,
- estandarizar contratos entre frontend y backend,
- y separar mejor la logica del negocio.

## Autor

Proyecto impulsado por Ezequiel Bellino para WapaPizzaParty.
