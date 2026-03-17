import json
import os
from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .auth import create_access_token, decode_access_token, verify_password
from .notifications import build_whatsapp_deep_link, build_whatsapp_message, dispatch_whatsapp_notification, should_notify_status
from .schemas import (
    AuthSession,
    LoginRequest,
    Order,
    OrderCreate,
    OrderStatusUpdate,
    Pizza,
    PizzaInventoryUpdate,
    SaleItem,
    SalesDay,
    SessionUser,
    User,
)

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent.parent
PIZZAS_FILE = BASE_DIR / 'pizzas.json'
VENTAS_FILE = BASE_DIR / 'ventas.json'
USERS_FILE = BASE_DIR / 'users.json'
FRONTEND_DIST_DIR = PROJECT_DIR / 'frontend' / 'dist'
FRONTEND_INDEX_FILE = FRONTEND_DIST_DIR / 'index.html'
LOCAL_ACCESS_ENABLED = os.getenv('WAPA_LOCAL_ACCESS_ENABLED', 'false').strip().lower() in {'1', 'true', 'yes', 'on'}
LOCAL_ACCESS_USERNAME = os.getenv('WAPA_LOCAL_ACCESS_USERNAME', 'admin').strip()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

if (FRONTEND_DIST_DIR / 'assets').exists():
    app.mount('/assets', StaticFiles(directory=FRONTEND_DIST_DIR / 'assets'), name='frontend-assets')


@app.get('/')
async def root():
    if FRONTEND_INDEX_FILE.exists():
        return FileResponse(FRONTEND_INDEX_FILE)

    return {'message': 'API de gestion de WapaPizzaParty'}


def calculate_subtotal(items: list[SaleItem]) -> int:
    return round(sum(item.price * item.quantity for item in items))


def calculate_total_pizzas(items: list[SaleItem]) -> float:
    return sum(item.quantity for item in items)


def refresh_sales_day(day: SalesDay) -> SalesDay:
    day.total_revenue = sum(order.total for order in day.orders)
    day.total_pizzas = sum(calculate_total_pizzas(order.sales) for order in day.orders)
    day.order_count = len(day.orders)
    return day


def load_users() -> list[User]:
    try:
        with USERS_FILE.open('r', encoding='utf-8') as file:
            raw_users = json.load(file)
            return [User.model_validate(item) for item in raw_users]
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def find_user_by_username(username: str) -> User | None:
    normalized_username = username.strip().lower()
    return next((user for user in load_users() if user.username.lower() == normalized_username), None)


def build_session_for_user(user: User) -> AuthSession:
    session_user = SessionUser(
        id=user.id,
        name=user.name,
        username=user.username,
        role=user.role,
    )
    token = create_access_token(session_user.model_dump())
    return AuthSession(access_token=token, user=session_user)


def is_local_request(request: Request) -> bool:
    client_host = (request.client.host if request.client else '').strip().lower()
    return client_host in {'127.0.0.1', '::1', 'localhost'}


def get_current_user(authorization: str = Header(default='')) -> SessionUser:
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token de acceso requerido.')

    token = authorization.replace('Bearer ', '', 1).strip()
    try:
        payload = decode_access_token(token)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error

    user = find_user_by_username(payload.get('username', ''))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail='Usuario no valido.')

    return SessionUser(
        id=user.id,
        name=user.name,
        username=user.username,
        role=user.role,
    )


def require_role(*roles: str):
    def dependency(current_user: SessionUser = Depends(get_current_user)) -> SessionUser:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail='No tienes permisos para esta accion.')
        return current_user

    return dependency


def build_order_from_payload(payload: OrderCreate) -> Order:
    subtotal = calculate_subtotal(payload.sales)
    shipping_cost = payload.shipping_cost if payload.include_shipping else 0
    timestamp = datetime.now()

    return Order(
        order_id=f'order-{timestamp.strftime("%Y%m%d%H%M%S%f")}',
        created_at=timestamp.isoformat(),
        status='procesado',
        receiver_name=payload.receiver_name.strip(),
        receiver_phone=payload.receiver_phone.strip(),
        payment_method=payload.payment_method.strip(),
        notes=payload.notes.strip(),
        include_shipping=payload.include_shipping,
        shipping_cost=shipping_cost,
        notify_whatsapp=payload.notify_whatsapp,
        use_vipper=payload.use_vipper,
        vipper_code=payload.vipper_code.strip(),
        sales=payload.sales,
        subtotal=subtotal,
        total=subtotal + shipping_cost,
        whatsapp_notification_status='pendiente' if payload.notify_whatsapp else 'no_solicitado',
    )


def sync_order_whatsapp_status(order: Order) -> Order:
    if not order.notify_whatsapp:
        return order.model_copy(
            update={
                'whatsapp_notification_status': 'no_solicitado',
                'whatsapp_last_message': '',
                'whatsapp_last_notification_at': '',
                'whatsapp_last_notified_status': '',
                'whatsapp_last_error': '',
            }
        )

    if not should_notify_status(order.status):
        return order

    if (
        order.whatsapp_last_notified_status == order.status
        and order.whatsapp_notification_status in {'simulado', 'enviado'}
    ):
        return order

    result = dispatch_whatsapp_notification(order)
    return order.model_copy(
        update={
            'whatsapp_notification_status': result.delivery_status,
            'whatsapp_last_message': result.message,
            'whatsapp_last_notification_at': result.sent_at,
            'whatsapp_last_notified_status': order.status,
            'whatsapp_last_error': result.error,
        }
    )


def build_legacy_order(raw_day: dict) -> Order:
    items = [SaleItem.model_validate(item) for item in raw_day.get('sales', [])]
    subtotal = calculate_subtotal(items)
    total = raw_day.get('total_revenue', subtotal)

    return Order(
        order_id=f"legacy-{raw_day.get('date', 'sin-fecha')}-1",
        created_at=f"{raw_day.get('date', datetime.now().strftime('%Y-%m-%d'))}T00:00:00",
        status='entregado',
        receiver_name='Registro legado',
        receiver_phone='',
        payment_method='no especificado',
        notes='Migrado desde el formato historico de ventas.',
        include_shipping=False,
        shipping_cost=max(total - subtotal, 0),
        notify_whatsapp=False,
        use_vipper=False,
        vipper_code='',
        sales=items,
        subtotal=subtotal,
        total=total,
        whatsapp_notification_status='no_solicitado',
    )


def normalize_sales_day(raw_day: dict) -> SalesDay:
    raw_orders = raw_day.get('orders')

    if raw_orders:
        orders = [Order.model_validate(order) for order in raw_orders]
    else:
        orders = [build_legacy_order(raw_day)] if raw_day.get('sales') else []

    normalized_day = SalesDay(date=raw_day['date'], orders=orders)
    return refresh_sales_day(normalized_day)


def cargar_ventas() -> list[SalesDay]:
    try:
        with VENTAS_FILE.open('r', encoding='utf-8') as file:
            raw_sales = json.load(file)
            return [normalize_sales_day(item) for item in raw_sales]
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        return []


def guardar_ventas(data: list[SalesDay]) -> None:
    with VENTAS_FILE.open('w', encoding='utf-8') as file:
        json.dump([refresh_sales_day(item).model_dump() for item in data], file, indent=4, ensure_ascii=False)


def load_pizzas() -> list[Pizza]:
    try:
        with PIZZAS_FILE.open('r', encoding='utf-8') as file:
            raw_pizzas = json.load(file)
            return [Pizza.model_validate(item) for item in raw_pizzas]
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_pizzas(pizzas: list[Pizza]) -> None:
    with PIZZAS_FILE.open('w', encoding='utf-8') as file:
        json.dump([pizza.model_dump() for pizza in pizzas], file, indent=4, ensure_ascii=False)


def reduce_stock_for_order(pizzas: list[Pizza], items: list[SaleItem]) -> list[Pizza]:
    updated_pizzas = pizzas[:]

    for item in items:
        for index, pizza in enumerate(updated_pizzas):
            if pizza.id != item.id:
                continue

            if not pizza.available:
                raise HTTPException(status_code=400, detail=f'{pizza.name} no esta disponible.')

            if pizza.stock + 1e-9 < item.quantity:
                raise HTTPException(status_code=400, detail=f'Stock insuficiente para {pizza.name}.')

            new_stock = round((pizza.stock - item.quantity) * 2) / 2
            updated_pizzas[index] = pizza.model_copy(
                update={
                    'stock': new_stock,
                    'available': pizza.available and new_stock > 0,
                }
            )
            break

    return updated_pizzas


@app.post('/auth/login', response_model=AuthSession)
async def login(payload: LoginRequest) -> AuthSession:
    user = find_user_by_username(payload.username)
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Credenciales invalidas.')

    return build_session_for_user(user)


@app.post('/auth/local-access', response_model=AuthSession)
async def local_access_login(request: Request) -> AuthSession:
    if not LOCAL_ACCESS_ENABLED:
        raise HTTPException(status_code=403, detail='El acceso rapido del puesto no esta habilitado.')

    if not is_local_request(request):
        raise HTTPException(status_code=403, detail='El acceso rapido solo puede usarse desde la PC local.')

    user = find_user_by_username(LOCAL_ACCESS_USERNAME)
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail='No encontramos el usuario configurado para acceso rapido.')

    return build_session_for_user(user)


@app.get('/auth/me', response_model=SessionUser)
async def me(current_user: SessionUser = Depends(get_current_user)) -> SessionUser:
    return current_user


@app.get('/ventas/', response_model=list[SalesDay])
async def obtener_ventas(_: SessionUser = Depends(get_current_user)) -> list[SalesDay]:
    return cargar_ventas()


@app.get('/ventas/{fecha}', response_model=SalesDay)
async def obtener_ventas_por_fecha(
    fecha: str,
    _: SessionUser = Depends(get_current_user),
) -> SalesDay:
    ventas = cargar_ventas()
    for venta in ventas:
        if venta.date == fecha:
            return venta
    raise HTTPException(status_code=404, detail='No hay ventas registradas para esta fecha.')


@app.post('/ventas/')
async def registrar_venta(
    venta: OrderCreate,
    _: SessionUser = Depends(require_role('admin', 'operator')),
):
    if venta.notify_whatsapp and venta.use_vipper:
        raise HTTPException(status_code=400, detail='Elige WhatsApp o vipper, no ambos a la vez.')

    if venta.notify_whatsapp and not venta.receiver_phone.strip():
        raise HTTPException(status_code=400, detail='Ingresa un telefono para poder avisar por WhatsApp.')

    if venta.use_vipper and not venta.vipper_code.strip():
        raise HTTPException(status_code=400, detail='Ingresa el numero o codigo del vipper para este pedido.')

    pizzas = load_pizzas()
    updated_pizzas = reduce_stock_for_order(pizzas, venta.sales)
    ventas = cargar_ventas()
    nueva_orden = sync_order_whatsapp_status(build_order_from_payload(venta))
    fecha_actual = datetime.now().strftime('%Y-%m-%d')

    for dia in ventas:
        if dia.date == fecha_actual:
            dia.orders.append(nueva_orden)
            refresh_sales_day(dia)
            guardar_ventas(ventas)
            save_pizzas(updated_pizzas)
            return {
                'message': 'Venta anadida al dia existente.',
                'order': nueva_orden.model_dump(),
            }

    nuevo_dia = refresh_sales_day(SalesDay(date=fecha_actual, orders=[nueva_orden]))
    ventas.append(nuevo_dia)
    guardar_ventas(ventas)
    save_pizzas(updated_pizzas)
    return {
        'message': 'Nueva venta registrada.',
        'order': nueva_orden.model_dump(),
    }


@app.patch('/ventas/{fecha}/{order_id}/status')
async def actualizar_estado_pedido(
    fecha: str,
    order_id: str,
    payload: OrderStatusUpdate,
    _: SessionUser = Depends(require_role('admin', 'operator')),
):
    ventas = cargar_ventas()

    for dia in ventas:
        if dia.date != fecha:
            continue

        for index, order in enumerate(dia.orders):
            if order.order_id == order_id:
                updated_order = order.model_copy(
                    update={
                        'status': payload.status,
                    }
                )
                updated_order = sync_order_whatsapp_status(updated_order)
                dia.orders[index] = updated_order
                refresh_sales_day(dia)
                guardar_ventas(ventas)
                return {
                    'message': 'Estado del pedido actualizado.',
                    'order': updated_order.model_dump(),
                }

        raise HTTPException(status_code=404, detail='No encontramos el pedido solicitado.')

    raise HTTPException(status_code=404, detail='No hay ventas registradas para esta fecha.')


@app.get('/ventas/{fecha}/{order_id}/whatsapp-link')
async def obtener_link_whatsapp_pedido(
    fecha: str,
    order_id: str,
    _: SessionUser = Depends(require_role('admin', 'operator')),
):
    ventas = cargar_ventas()

    for dia in ventas:
        if dia.date != fecha:
            continue

        for order in dia.orders:
            if order.order_id == order_id:
                if not order.receiver_phone.strip():
                    raise HTTPException(status_code=400, detail='El pedido no tiene telefono de contacto.')

                return {
                    'phone': order.receiver_phone,
                    'message': build_whatsapp_message(order),
                    'url': build_whatsapp_deep_link(order),
                }

        raise HTTPException(status_code=404, detail='No encontramos el pedido solicitado.')

    raise HTTPException(status_code=404, detail='No hay ventas registradas para esta fecha.')


@app.get('/pizzas', response_model=list[Pizza])
async def get_pizzas(_: SessionUser = Depends(get_current_user)) -> list[Pizza]:
    return load_pizzas()


@app.patch('/pizzas/{pizza_id}', response_model=Pizza)
async def actualizar_inventario_pizza(
    pizza_id: int,
    payload: PizzaInventoryUpdate,
    _: SessionUser = Depends(require_role('admin', 'operator')),
) -> Pizza:
    pizzas = load_pizzas()

    for index, pizza in enumerate(pizzas):
        if pizza.id != pizza_id:
            continue

        updates = {}
        if payload.available is not None:
            updates['available'] = payload.available
        if payload.stock is not None:
            updates['stock'] = payload.stock
            updates['available'] = payload.stock > 0 if payload.available is None else payload.available
        if payload.low_stock_threshold is not None:
            updates['low_stock_threshold'] = payload.low_stock_threshold

        updated_pizza = pizza.model_copy(update=updates)
        pizzas[index] = updated_pizza
        save_pizzas(pizzas)
        return updated_pizza

    raise HTTPException(status_code=404, detail='No encontramos la pizza solicitada.')


@app.get('/{full_path:path}', include_in_schema=False)
async def frontend_spa_fallback(full_path: str):
    if not FRONTEND_INDEX_FILE.exists():
        raise HTTPException(status_code=404, detail='Ruta no encontrada.')

    if full_path.startswith(('auth', 'ventas', 'pizzas', 'docs', 'openapi.json', 'redoc')):
        raise HTTPException(status_code=404, detail='Ruta no encontrada.')

    asset_candidate = FRONTEND_DIST_DIR / full_path
    if asset_candidate.exists() and asset_candidate.is_file():
        return FileResponse(asset_candidate)

    return FileResponse(FRONTEND_INDEX_FILE)
