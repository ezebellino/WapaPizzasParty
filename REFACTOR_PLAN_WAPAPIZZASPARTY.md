# REFACTOR PLAN WAPAPIZZASPARTY

## Objetivo

Ordenar la aplicacion para que pueda crecer desde una demo funcional hacia una app de gestion simple, mantenible y lista para sumar nuevas funciones sin romper lo existente.

## Diagnostico actual

- La app ya resuelve un flujo base valioso: mostrar pizzas, armar carrito y registrar ventas.
- El frontend y el backend todavia mezclan decisiones de prototipo con decisiones de producto.
- Hay deuda tecnica visible en estructura, datos, codificacion de textos y organizacion del repo.
- Antes de agregar mas pantallas, conviene consolidar base tecnica y modelo de negocio.

## Principios del refactor

- Priorizar claridad antes que complejidad.
- Mantener el flujo actual funcionando mientras mejoramos la estructura.
- Separar mejor logica de negocio, UI y persistencia.
- Evitar agregar features grandes hasta estabilizar el nucleo.
- Trabajar en cambios chicos, verificables y con valor concreto.

## Etapa 1 - Orden del repositorio

- Definir claramente si `frontend` va a seguir como repo anidado o si se integra al repo principal.
- Limpiar archivos que no deberian versionarse como `node_modules`, `dist`, `__pycache__` y archivos generados.
- Agregar o corregir `.gitignore` en raiz y en frontend.
- Reemplazar READMEs temporales por documentacion propia del proyecto.

## Etapa 2 - Consolidacion del dominio

- Definir mejor el modelo de datos de pizzas, ventas y carrito.
- Estandarizar nombres de campos y tipos esperados.
- Corregir textos y datos con problemas de codificacion en JSON y vistas.
- Validar entradas del backend en lugar de aceptar `dict` sin esquema.

## Etapa 3 - Backend mantenible

- Reintroducir una capa de modelos y esquemas, pero alineada al negocio real de la pizzeria.
- Separar rutas, servicios y persistencia.
- Decidir si se mantiene JSON como almacenamiento inicial o si se migra a base de datos.
- Agregar validaciones para ventas vacias, cantidades invalidas y errores de archivo.

## Etapa 4 - Frontend mas consistente

- Unificar estilos y evitar mezcla innecesaria entre CSS modules, Tailwind y estilos heredados.
- Separar componentes de UI de componentes con logica.
- Centralizar llamadas a la API y manejo de errores.
- Mejorar estados de carga, vacio, error y confirmacion.

## Etapa 5 - Funciones de gestion reales

- Gestionar stock o disponibilidad por producto si eso aplica al negocio.
- Registrar mas detalle por venta: cliente, envio, observaciones, medio de pago.
- Agregar resumen diario o semanal.
- Preparar base para futuras vistas de administracion.

## Etapa 6 - Calidad y despliegue

- Agregar pruebas minimas a frontend y backend.
- Definir entorno local reproducible.
- Documentar como correr frontend y backend.
- Preparar una version lista para deploy sin archivos de plantilla o ruido tecnico.

## Orden sugerido de ejecucion

1. Limpiar repositorio y definir estructura Git.
2. Normalizar datos y contratos entre frontend y backend.
3. Refactorizar backend por capas simples.
4. Refactorizar frontend por componentes y servicios.
5. Agregar mejoras funcionales de gestion.
6. Cerrar con testing, documentacion y despliegue.

## Primera tanda de tareas concretas

- Crear `.gitignore` correcto en raiz y revisar el de `frontend`.
- Limpiar el README principal y el del frontend.
- Corregir codificacion de `backend/app/pizzas.json` y `backend/app/ventas.json`.
- Crear esquemas Pydantic para pizzas y ventas.
- Mover fetches del frontend a un modulo `api`.
- Revisar si `SalesHistory` y estilos asociados deben entrar al repo interno de `frontend`.

## Criterio para seguir

Vamos bien si cada etapa deja:

- menos ambiguedad en la estructura,
- menos archivos accidentales versionados,
- contratos mas claros entre frontend y backend,
- y una base mas facil de extender.
