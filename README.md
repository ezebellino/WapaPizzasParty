# WapaPizzaParty

Aplicacion local para mostrador, cocina y seguimiento comercial de una pizzeria, pensada para funcionar en una sola PC del negocio.

Hoy la app ya esta orientada a la operatoria real del local: toma de pedidos rapida, comanda automatica para cocina, avisos al cliente, editor interno de pizzas, tesoreria con indicadores y arranque local para Windows.

## Estado actual

- Estado: producto operativo local en evolucion.
- Enfoque actual: una sola PC, flujo simple, sin pasos manuales innecesarios.
- Plan vigente: ver [PLAN_WAPAPIZZAPARTY_LOCAL.md](./PLAN_WAPAPIZZAPARTY_LOCAL.md).

## Lo que ya hace la app

- Mostrador para carga rapida de pedidos.
- Soporte para medias pizzas y pizzas completas.
- Stock automatico al registrar ventas.
- Comanda de cocina con impresion automatica.
- Reimpresion de comandas desde tesoreria.
- Aviso al cliente por WhatsApp prearmado o por vipper.
- Flujo simple de pedido:
  `en_preparacion`, `entregado`, `cancelado`.
- Tesoreria con:
  ventas,
  pizzas vendidas,
  ticket promedio,
  medios de pago,
  ranking de productos,
  resumen diario,
  graficas por rango de fechas,
  y reporte comercial imprimible en PDF.
- Editor interno de catalogo para crear y editar pizzas sin tocar JSON a mano.
- Acceso rapido de puesto local.
- Inicio local para Windows y creacion de acceso directo de escritorio.
- Logs locales de errores y warnings del puesto.

## Stack

- Frontend: React, Vite, React Router, Tailwind, SweetAlert2.
- Backend: FastAPI.
- Persistencia actual: archivos JSON.

## Estructura

```text
Project_1/
|- backend/
|  |- app/
|  |  |- main.py
|  |  |- notifications.py
|  |  |- pizzas.json
|  |  |- ventas.json
|  |  |- users.json
|- frontend/
|  |- public/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- store/
|  |  |- utils/
|- scripts/
|  |- start-dev.ps1
|  |- start-local-app.ps1
|  |- create-desktop-shortcut.ps1
|- PLAN_WAPAPIZZAPARTY_LOCAL.md
|- README.md
```

## Formas de uso

### Desarrollo

Backend:

```powershell
cd backend
..\venv\Scripts\uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

### Inicio rapido en Windows

Para levantar backend y frontend por separado en desarrollo:

```powershell
.\scripts\start-dev.ps1
```

### Modo local del puesto

Para usar la app como sistema local del negocio:

```powershell
.\scripts\start-local-app.ps1
```

O:

```bat
.\scripts\start-local-app.cmd
```

Eso:

- compila el frontend si hace falta,
- levanta FastAPI en `http://127.0.0.1:8000`,
- y abre la aplicacion local lista para operar.

### Acceso directo

Para crear el acceso directo de escritorio:

```powershell
.\scripts\create-desktop-shortcut.ps1
```

O:

```bat
.\scripts\create-desktop-shortcut.cmd
```

## Variables de entorno

Crea `backend/.env` tomando como base `backend/.env.example`.

Configuracion recomendada para la PC del negocio:

```env
WAPA_AUTH_SECRET=una-clave-segura
WAPA_LOCAL_ACCESS_ENABLED=true
WAPA_LOCAL_ACCESS_USERNAME=admin
WAPA_SHOW_MANUAL_LOGIN=false
WHATSAPP_MODE=mock
WHATSAPP_PROVIDER=mock
```

Claves importantes:

- `WAPA_LOCAL_ACCESS_ENABLED=true`
  habilita el boton `Ingresar al puesto`
- `WAPA_SHOW_MANUAL_LOGIN=false`
  oculta el login manual para simplificar la operatoria
- `WHATSAPP_MODE=mock`
  deja preparado el mensaje sin envio real

Para envio real con Twilio:

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

## Logs locales

La app guarda logs rotativos en:

```text
backend/app/logs/wapapizzaparty.log
```

Ahi quedan:

- errores y warnings del backend,
- accesos al puesto,
- pedidos registrados y cambios de estado,
- y errores o warnings relevantes del frontend.

Ademas, al arrancar el backend se ejecuta un chequeo automatico de configuracion del puesto.

## Catalogo y stock

Hoy el catalogo base y el stock viven en:

- [backend/app/pizzas.json](./backend/app/pizzas.json)

Pero la edicion diaria ya puede hacerse desde la app en la vista `Catalogo`.

Recomendacion actual:

- versionar el comportamiento y la estructura del sistema,
- pero no usar Git como historial del stock diario del local.

## Flujo operativo actual

1. Se carga el pedido desde el mostrador.
2. La venta descuenta stock automaticamente.
3. La comanda se imprime automaticamente.
4. El pedido entra en `en_preparacion`.
5. Luego se cierra como `entregado` o `cancelado`.
6. Tesoreria consolida ventas, cantidades y metricas.

## Situacion actual y siguientes pasos

La app ya tiene una base comercial solida para un local con una sola PC.

Los siguientes pasos mas naturales son:

- terminar de definir si hace falta instalador o si alcanza con launcher local,
- seguir refinando catalogo, reportes y experiencia del puesto,
- y evaluar respaldo de datos o migracion futura desde JSON a una persistencia mas robusta.

## Operacion recomendada del dia a dia

- Ingresar con el boton `Ingresar al puesto`.
- Tomar el pedido desde mostrador y registrarlo.
- Dejar que la comanda se imprima automaticamente para cocina.
- Cerrar cada pedido solo como `entregado` o `cancelado`.
- Consultar tesoreria para revisar ventas, cantidades y tendencias del negocio.

## Autor

Proyecto impulsado por Ezequiel Bellino para WapaPizzaParty.
