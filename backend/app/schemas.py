from pydantic import BaseModel, Field, field_validator


ORDER_STATUSES = {'en_preparacion', 'entregado', 'cancelado'}
USER_ROLES = {'admin', 'operator'}
WHATSAPP_NOTIFICATION_STATUSES = {'no_solicitado', 'pendiente', 'simulado', 'enviado', 'fallido'}

LEGACY_STATUS_MAP = {
    'procesado': 'en_preparacion',
    'listo_para_retirar': 'entregado',
}


def normalize_half_step(value: float, *, allow_zero: bool = False) -> float:
    normalized = round(float(value) * 2) / 2
    minimum = 0 if allow_zero else 0.5

    if normalized < minimum or abs(normalized - float(value)) > 1e-9:
        step_label = '0.5'
        if allow_zero:
            raise ValueError(f'El valor debe ser mayor o igual a 0 y avanzar en pasos de {step_label}.')
        raise ValueError(f'El valor debe ser mayor o igual a {step_label} y avanzar en pasos de {step_label}.')

    return normalized


def normalize_order_status(value: str) -> str:
    normalized = value.strip().lower()
    normalized = LEGACY_STATUS_MAP.get(normalized, normalized)
    if normalized not in ORDER_STATUSES:
        raise ValueError('Estado de pedido invalido.')
    return normalized


class User(BaseModel):
    id: int
    name: str = Field(min_length=1)
    username: str = Field(min_length=1)
    role: str = Field(min_length=1)
    is_active: bool = Field(default=True)
    password_hash: str = Field(min_length=1)

    @field_validator('role')
    @classmethod
    def validate_role(cls, role: str) -> str:
        normalized_role = role.strip().lower()
        if normalized_role not in USER_ROLES:
            raise ValueError('Rol invalido.')
        return normalized_role


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class SessionUser(BaseModel):
    id: int
    name: str
    username: str
    role: str


class AuthSession(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: SessionUser


class ClientLogEntry(BaseModel):
    level: str = Field(min_length=1, default='error')
    message: str = Field(min_length=1)
    source: str = Field(default='frontend')
    path: str = Field(default='')
    details: str = Field(default='')

    @field_validator('level')
    @classmethod
    def validate_level(cls, level: str) -> str:
        normalized_level = level.strip().lower()
        if normalized_level not in {'info', 'warning', 'error'}:
            raise ValueError('Nivel de log invalido.')
        return normalized_level


class Pizza(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    price: int = Field(gt=0)
    available: bool = Field(default=True)
    stock: float = Field(default=0, ge=0)
    low_stock_threshold: float = Field(default=3, ge=0)

    @field_validator('stock', 'low_stock_threshold')
    @classmethod
    def validate_stock_values(cls, value: float) -> float:
        return normalize_half_step(value, allow_zero=True)


class PizzaCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    price: int = Field(gt=0)
    available: bool = Field(default=True)
    stock: float = Field(default=0, ge=0)
    low_stock_threshold: float = Field(default=3, ge=0)

    @field_validator('stock', 'low_stock_threshold')
    @classmethod
    def validate_stock_values(cls, value: float) -> float:
        return normalize_half_step(value, allow_zero=True)


class PizzaUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, min_length=1)
    price: int | None = Field(default=None, gt=0)
    available: bool | None = None
    stock: float | None = Field(default=None, ge=0)
    low_stock_threshold: float | None = Field(default=None, ge=0)

    @field_validator('stock', 'low_stock_threshold')
    @classmethod
    def validate_stock_values(cls, value: float | None) -> float | None:
        if value is None:
            return value
        return normalize_half_step(value, allow_zero=True)


class SaleItem(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(default='')
    price: int = Field(gt=0)
    quantity: float = Field(gt=0)

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, value: float) -> float:
        return normalize_half_step(value)


class OrderBase(BaseModel):
    receiver_name: str = Field(min_length=1)
    receiver_phone: str = Field(default='')
    payment_method: str = Field(default='efectivo', min_length=1)
    notes: str = Field(default='')
    include_shipping: bool = Field(default=False)
    shipping_cost: int = Field(default=0, ge=0)
    notify_whatsapp: bool = Field(default=False)
    use_vipper: bool = Field(default=False)
    vipper_code: str = Field(default='')
    sales: list[SaleItem] = Field(min_length=1)

    @field_validator('sales')
    @classmethod
    def validate_sales(cls, sales: list[SaleItem]) -> list[SaleItem]:
        if not sales:
            raise ValueError('La venta debe incluir al menos un producto.')
        return sales

    @field_validator('receiver_phone')
    @classmethod
    def normalize_phone(cls, phone: str) -> str:
        return phone.strip()

    @field_validator('notes')
    @classmethod
    def normalize_notes(cls, notes: str) -> str:
        return notes.strip()

    @field_validator('vipper_code')
    @classmethod
    def normalize_vipper_code(cls, vipper_code: str) -> str:
        return vipper_code.strip()


class OrderCreate(OrderBase):
    pass


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=1)

    @field_validator('status')
    @classmethod
    def validate_status(cls, status: str) -> str:
        return normalize_order_status(status)


class Order(OrderBase):
    order_id: str
    created_at: str
    status: str = Field(default='en_preparacion')
    subtotal: int = Field(ge=0)
    total: int = Field(ge=0)
    whatsapp_notification_status: str = Field(default='pendiente')
    whatsapp_last_message: str = Field(default='')
    whatsapp_last_notification_at: str = Field(default='')
    whatsapp_last_notified_status: str = Field(default='')
    whatsapp_last_error: str = Field(default='')

    @field_validator('status')
    @classmethod
    def validate_status(cls, status: str) -> str:
        return normalize_order_status(status)

    @field_validator('whatsapp_notification_status')
    @classmethod
    def validate_whatsapp_notification_status(cls, status: str) -> str:
        normalized_status = status.strip().lower()
        if normalized_status not in WHATSAPP_NOTIFICATION_STATUSES:
            raise ValueError('Estado de notificacion de WhatsApp invalido.')
        return normalized_status


class SalesDay(BaseModel):
    date: str
    orders: list[Order] = Field(default_factory=list)
    total_revenue: int = Field(default=0, ge=0)
    total_pizzas: float = Field(default=0, ge=0)
    order_count: int = Field(default=0, ge=0)
