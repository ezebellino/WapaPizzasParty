from pydantic import BaseModel, Field, field_validator


class Pizza(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    price: int = Field(gt=0)


class SaleItem(BaseModel):
    id: int
    name: str = Field(min_length=1)
    description: str = Field(default='')
    price: int = Field(gt=0)
    quantity: int = Field(gt=0)


class SaleCreate(BaseModel):
    sales: list[SaleItem] = Field(min_length=1)
    total_revenue: int = Field(ge=0)

    @field_validator('sales')
    @classmethod
    def validate_sales(cls, sales: list[SaleItem]) -> list[SaleItem]:
        if not sales:
            raise ValueError('La venta debe incluir al menos un producto.')
        return sales


class SalesDay(BaseModel):
    date: str
    sales: list[SaleItem]
    total_revenue: int = Field(ge=0)
