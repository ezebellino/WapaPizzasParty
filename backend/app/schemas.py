from pydantic import BaseModel, Field, field_validator


ORDER_STATUSES = {'pendiente', 'en_preparacion', 'entregado', 'cancelado'}


class Pizza(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    price: int = Field(gt=0)
    available: bool = Field(default=True)
    stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=3, ge=0)


class PizzaInventoryUpdate(BaseModel):
    available: bool | None = None
    stock: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)


class SaleItem(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(default='')
    price: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderBase(BaseModel):
    receiver_name: str = Field(min_length=1)
    receiver_phone: str = Field(default='')
    payment_method: str = Field(default='efectivo', min_length=1)
    notes: str = Field(default='')
    include_shipping: bool = Field(default=False)
    shipping_cost: int = Field(default=0, ge=0)
    sales: list[SaleItem] = Field(min_length=1)

    @field_validator('sales')
    @classmethod
    def validate_sales(cls, sales: list[SaleItem]) -> list[SaleItem]:
        if not sales:
            raise ValueError('La venta debe incluir al menos un producto.')
        return sales


class OrderCreate(OrderBase):
    pass


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=1)

    @field_validator('status')
    @classmethod
    def validate_status(cls, status: str) -> str:
        normalized_status = status.strip().lower()
        if normalized_status not in ORDER_STATUSES:
            raise ValueError('Estado de pedido invalido.')
        return normalized_status


class Order(OrderBase):
    order_id: str
    created_at: str
    status: str = Field(default='pendiente')
    subtotal: int = Field(ge=0)
    total: int = Field(ge=0)

    @field_validator('status')
    @classmethod
    def validate_status(cls, status: str) -> str:
        normalized_status = status.strip().lower()
        if normalized_status not in ORDER_STATUSES:
            raise ValueError('Estado de pedido invalido.')
        return normalized_status


class SalesDay(BaseModel):
    date: str
    orders: list[Order] = Field(default_factory=list)
    total_revenue: int = Field(default=0, ge=0)
    total_pizzas: int = Field(default=0, ge=0)
    order_count: int = Field(default=0, ge=0)
