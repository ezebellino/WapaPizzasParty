# Guia De Entrega WapaPizzaParty

Esta guia sirve para instalar o trasladar WapaPizzaParty a otra PC del negocio.

## Que entregar

La opcion recomendada hoy es entregar:

- [WapaPizzaParty-portable.zip](/c:/Users/ezebe/OneDrive/Proyectos/Project_1/portable-build/WapaPizzaParty-portable.zip)

O bien la carpeta ya descomprimida:

- [portable-build/WapaPizzaParty](/c:/Users/ezebe/OneDrive/Proyectos/Project_1/portable-build/WapaPizzaParty)

## Como instalar en otra PC

1. Copiar `WapaPizzaParty-portable.zip` por pendrive, Drive o mail.
2. Descomprimir el `.zip` en una carpeta fija.
3. Entrar a la carpeta `WapaPizzaParty`.
4. Ejecutar `scripts\create-portable-shortcut.cmd`.
5. Abrir la app desde el acceso directo creado en el escritorio.

## Como abrir la app

Tambien se puede abrir manualmente desde:

- `scripts\start-portable-app.cmd`

La app levanta localmente en:

- `http://127.0.0.1:8000`

## Recomendaciones importantes

- No mover archivos internos por separado.
- No borrar la carpeta `backend\app`, porque ahi viven los datos del negocio.
- Mantener siempre junta toda la carpeta `WapaPizzaParty`.
- Si se cambia de PC, copiar tambien los datos actuales del local.

## Donde estan los datos

Dentro de la portable, los datos operativos estan en:

- `backend\app\pizzas.json`
- `backend\app\ventas.json`
- `backend\app\users.json`
- `backend\app\logs\wapapizzaparty.log`

## Reinicios utiles desde la app

Dentro del sistema ya existen estas acciones:

- `Borrar tesoreria`
  borra historial de ventas y pedidos
- `Reiniciar stock a cero`
  deja todas las pizzas sin stock

Ambas acciones piden confirmacion escrita.

## Cuando conviene regenerar la portable

Conviene volver a generar el paquete portable cuando:

- hubo cambios en la app
- cambiaste logo, scripts o acceso directo
- modificaste catalogo base que queres entregar como punto de partida

Comando para regenerarla:

```powershell
.\scripts\build-portable-package.ps1 -CreateZip
```

## Soporte rapido

Si la app no abre o falla algo:

1. revisar `backend\app\logs\wapapizzaparty.log`
2. verificar que la carpeta completa siga en el mismo lugar
3. volver a crear el acceso directo con `scripts\create-portable-shortcut.cmd`
