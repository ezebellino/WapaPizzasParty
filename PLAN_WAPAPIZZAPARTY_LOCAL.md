# PLAN WAPAPIZZAPARTY LOCAL

## Norte del producto

WapaPizzaParty deja de pensarse como una web app hosteada con multiples roles y pasa a pensarse como una aplicacion local de mostrador, instalada en una sola PC del negocio.

El objetivo ya no es administrar desde varios puestos sino registrar pedidos rapido, imprimir una comanda clara para cocina, avisar al cliente cuando el pedido este listo y llevar un control simple de caja.

## Decisiones ya confirmadas

- El nombre correcto del producto es `WapaPizzaParty`.
- La app se va a usar en una sola PC.
- No hace falta separar `admin` y `caja` en el flujo diario.
- El equipo de cocina no va a actualizar estados desde el sistema.
- El sistema debe imprimir una comanda al tomar el pedido.
- Si el cliente deja celular, se le puede abrir WhatsApp con mensaje prearmado.
- Si el cliente no deja celular, debe existir opcion de `vipper` para llamarlo cuando el pedido este listo.
- El logo oficial en JPEG/PDF debe integrarse en la interfaz y en la identidad visual.

## Cambio de enfoque tecnico

Estas decisiones cambian el orden de prioridad:

1. Flujo operativo del mostrador.
2. Impresion de comanda.
3. Aviso al cliente.
4. Caja y seguimiento.
5. Instalacion local como aplicacion de escritorio.

## Hoja de ruta propuesta

### Etapa 1 - Branding y renombre correcto

- Corregir `WapaPizzasParty` a `WapaPizzaParty` en UI, README, backend y textos visibles.
- Incorporar el logo oficial en la app.
- Ajustar paleta y look general segun el logo rosa/fucsia sin sobrecargar la interfaz.
- Definir un favicon e icono de acceso directo para escritorio.

Estado actual:

- En progreso avanzado.
- Ya se corrigio buena parte del nombre visible a `WapaPizzaParty`.
- Ya se integro el logo oficial en navbar, login y pantalla principal.
- Queda pendiente cerrar el renombre tecnico completo y preparar favicon/icono.

### Etapa 2 - Flujo unico de mostrador

- Unificar los roles en un solo perfil operativo.
- Simplificar login o incluso evaluar acceso directo sin login si la PC es de uso interno.
- Reordenar la pantalla principal para que el foco sea:
  pedido, total, tipo de retiro, celular o vipper, impresion.
- Reducir friccion en el alta del pedido.

Estado actual:

- En progreso firme.
- Ya se relajaron varias restricciones de permisos para una sola PC.
- Ya se reordeno el mostrador para priorizar la toma de pedido, los pedidos activos y la columna operativa.
- Ya se quitaron controles manuales de stock innecesarios en la UI: el descuento se hace automatico al registrar la venta.
- El siguiente paso fuerte es simplificar todavia mas el acceso y terminar de pulir el flujo principal de toma de pedido.

### Etapa 3 - Comanda para cocina

- Generar una vista de comanda imprimible al confirmar el pedido.
- Incluir:
  numero de pedido, hora, detalle de pizzas, observaciones y forma de entrega.
- Permitir imprimir automaticamente o abrir vista de impresion.
- Separar visualmente comprobante para cliente y comanda para cocina si hace falta.

Estado actual:

- En progreso firme.
- Ya existe comanda imprimible desde mostrador y tesoreria.
- La impresion ahora acompana mejor el flujo real de cocina.
- La comanda ya se imprime automaticamente al registrar el pedido.
- Queda pendiente ajustar detalles finales de formato y hardware de impresion si hiciera falta.

### Etapa 4 - Aviso al cliente

- Mantener WhatsApp prearmado para pedidos con celular.
- Agregar modo `vipper` cuando no haya telefono:
  numero de vipper, identificador corto, estado listo para llamar.
- Incorporar accion rapida de `pedido listo` que:
  abre WhatsApp o marca pedido para llamar por vipper.

Estado actual:

- Parcialmente resuelto.
- Ya existe apertura de WhatsApp con comprobante prearmado desde la app.
- Ya existe `vipper` como alternativa cuando no hay celular.
- Ya existe accion rapida de `pedido listo` desde mostrador y tesoreria.
- Queda pendiente terminar de definir el flujo final de aviso para la operacion diaria.

### Etapa 5 - Caja simple y util

- Mantener tesoreria enfocada en una sola PC y un solo operador.
- Priorizar:
  ventas del dia, total cobrado, medios de pago y cantidad de pizzas.
- Sacar complejidad de estados manuales que no aporten al nuevo flujo.
- Conservar exportacion y reportes utiles sin volver la pantalla pesada.

Estado actual:

- En progreso firme.
- Tesoreria ya permite filtrar por rango de fechas.
- Ya existe exportacion CSV del rango elegido.
- Ya se agregaron visuales simples de facturacion y produccion por dia.
- El siguiente paso es profundizar metricas sin perder velocidad de uso.

### Etapa 6 - Aplicacion de escritorio

- Evaluar empaquetado para Windows.
- Opcion recomendada a validar:
  app local con frontend + backend corriendo juntos y acceso por icono directo.
- Definir mecanismo de inicio:
  script, servicio local o empaquetado instalable.
- Preparar icono, nombre visible y documentacion de instalacion.

## Orden recomendado de implementacion

1. Renombre correcto + logo.
2. Unificacion de roles.
3. Replanteo del mostrador para flujo unico.
4. Comanda imprimible.
5. Vipper + WhatsApp segun el dato disponible.
6. Ajuste de tesoreria al nuevo flujo.
7. Empaquetado como app local de escritorio.

## Siguiente bloque sugerido

El siguiente bloque que mas conviene hacer ahora es:

1. Simplificar el acceso para uso interno en una sola PC.
2. Terminar de pulir la pantalla principal alrededor del pedido activo.
3. Avanzar con el empaquetado local para Windows.
4. Resolver favicon, icono y acceso directo final.

## Criterio de exito

Vamos bien si al final del proceso una persona puede:

- abrir la aplicacion desde un icono,
- cargar un pedido en segundos,
- imprimir la comanda para cocina,
- avisar por WhatsApp o vipper,
- y cerrar el dia con un control simple de caja.
