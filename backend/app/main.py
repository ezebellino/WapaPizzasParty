import json
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    Order,
    OrderCreate,
    OrderStatusUpdate,
    Pizza,
    PizzaInventoryUpdate,
    SaleItem,
    SalesDay,
)

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
PIZZAS_FILE = BASE_DIR / 'pizzas.json'
VENTAS_FILE = BASE_DIR / 'ventas.json'

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
async def root():
    return {'message': 'API de gestion de WapaPizzasParty'}


def calculate_subtotal(items: list[SaleItem]) -> int:
    return sum(item.price * item.quantity for item in items)


def calculate_total_pizzas(items: list[SaleItem]) -> int:
    return sum(item.quantity for item in items)


def refresh_sales_day(day: SalesDay) -> SalesDay:
    day.total_revenue = sum(order.total for order in day.orders)
    day.total_pizzas = sum(calculate_total_pizzas(order.sales) for order in day.orders)
    day.order_count = len(day.orders)
    return day


def build_order_from_payload(payload: OrderCreate) -> Order:
    subtotal = calculate_subtotal(payload.sales)
    shipping_cost = payload.shipping_cost if payload.include_shipping else 0
    timestamp = datetime.now()

    return Order(
        order_id=f'order-{timestamp.strftime("%Y%m%d%H%M%S%f")}',
        created_at=timestamp.isoformat(),
        status='pendiente',
        receiver_name=payload.receiver_name.strip(),
        receiver_phone=payload.receiver_phone.strip(),
        payment_method=payload.payment_method.strip(),
        notes=payload.notes.strip(),
        include_shipping=payload.include_shipping,
        shipping_cost=shipping_cost,
        sales=payload.sales,
        subtotal=subtotal,
        total=subtotal + shipping_cost,
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
        sales=items,
        subtotal=subtotal,
        total=total,
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

            if pizza.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f'Stock insuficiente para {pizza.name}.')

            new_stock = pizza.stock - item.quantity
            updated_pizzas[index] = pizza.model_copy(
                update={
                    'stock': new_stock,
                    'available': pizza.available and new_stock > 0,
                }
            )
            break

    return updated_pizzas


@app.get('/ventas/', response_model=list[SalesDay])
async def obtener_ventas() -> list[SalesDay]:
    return cargar_ventas()


@app.get('/ventas/{fecha}', response_model=SalesDay)
async def obtener_ventas_por_fecha(fecha: str) -> SalesDay:
    ventas = cargar_ventas()
    for venta in ventas:
        if venta.date == fecha:
            return venta
    raise HTTPException(status_code=404, detail='No hay ventas registradas para esta fecha.')


@app.post('/ventas/')
async def registrar_venta(venta: OrderCreate):
    pizzas = load_pizzas()
    updated_pizzas = reduce_stock_for_order(pizzas, venta.sales)
    ventas = cargar_ventas()
    nueva_orden = build_order_from_payload(venta)
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
async def actualizar_estado_pedido(fecha: str, order_id: str, payload: OrderStatusUpdate):
    ventas = cargar_ventas()

    for dia in ventas:
        if dia.date != fecha:
            continue

        for index, order in enumerate(dia.orders):
            if order.order_id == order_id:
                updated_order = order.model_copy(update={'status': payload.status})
                dia.orders[index] = updated_order
                refresh_sales_day(dia)
                guardar_ventas(ventas)
                return {
                    'message': 'Estado del pedido actualizado.',
                    'order': updated_order.model_dump(),
                }

        raise HTTPException(status_code=404, detail='No encontramos el pedido solicitado.')

    raise HTTPException(status_code=404, detail='No hay ventas registradas para esta fecha.')


@app.get('/pizzas', response_model=list[Pizza])
async def get_pizzas() -> list[Pizza]:
    return load_pizzas()


@app.patch('/pizzas/{pizza_id}', response_model=Pizza)
async def actualizar_inventario_pizza(pizza_id: int, payload: PizzaInventoryUpdate) -> Pizza:
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
