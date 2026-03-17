import json
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import Pizza, SaleCreate, SalesDay

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
PIZZAS_FILE = BASE_DIR / "pizzas.json"
VENTAS_FILE = BASE_DIR / "ventas.json"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API de ventas de pizzeria"}


def cargar_ventas() -> list[SalesDay]:
    try:
        with VENTAS_FILE.open("r", encoding="utf-8") as file:
            raw_sales = json.load(file)
            return [SalesDay.model_validate(item) for item in raw_sales]
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def guardar_ventas(data: list[SalesDay]) -> None:
    with VENTAS_FILE.open("w", encoding="utf-8") as file:
        json.dump([item.model_dump() for item in data], file, indent=4, ensure_ascii=False)


@app.get("/ventas/", response_model=list[SalesDay])
async def obtener_ventas() -> list[SalesDay]:
    return cargar_ventas()


@app.get("/ventas/{fecha}", response_model=SalesDay)
async def obtener_ventas_por_fecha(fecha: str) -> SalesDay:
    ventas = cargar_ventas()
    for venta in ventas:
        if venta.date == fecha:
            return venta
    raise HTTPException(status_code=404, detail="No hay ventas registradas para esta fecha.")


@app.post("/ventas/")
async def registrar_venta(venta: SaleCreate):
    ventas = cargar_ventas()
    fecha_actual = datetime.now().strftime("%Y-%m-%d")

    for dia in ventas:
        if dia.date == fecha_actual:
            dia.sales.extend(venta.sales)
            dia.total_revenue += venta.total_revenue
            guardar_ventas(ventas)
            return {"message": "Venta anadida al dia existente."}

    nueva_venta = SalesDay(
        date=fecha_actual,
        sales=venta.sales,
        total_revenue=venta.total_revenue,
    )
    ventas.append(nueva_venta)
    guardar_ventas(ventas)
    return {"message": "Nueva venta registrada."}


def load_pizzas() -> list[Pizza]:
    try:
        with PIZZAS_FILE.open("r", encoding="utf-8") as file:
            raw_pizzas = json.load(file)
            return [Pizza.model_validate(item) for item in raw_pizzas]
    except FileNotFoundError:
        return []


@app.get("/pizzas", response_model=list[Pizza])
async def get_pizzas() -> list[Pizza]:
    return load_pizzas()
