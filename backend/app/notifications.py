import os
from dataclasses import dataclass
from datetime import datetime

from .schemas import Order


WHATSAPP_MODE = os.getenv('WHATSAPP_MODE', 'mock').strip().lower()
WHATSAPP_PROVIDER = os.getenv('WHATSAPP_PROVIDER', 'mock').strip().lower()

STATUS_MESSAGES = {
    'procesado': 'Hola {receiver_name}, tu pedido de WapaPizzas ya fue procesado. Total: ${total}.',
    'en_preparacion': 'Hola {receiver_name}, tu pedido de WapaPizzas ya esta en preparacion.',
    'listo_para_retirar': 'Hola {receiver_name}, tu pedido de WapaPizzas esta listo para retirar.',
    'entregado': 'Hola {receiver_name}, gracias por tu compra en WapaPizzas.',
    'cancelado': 'Hola {receiver_name}, tu pedido de WapaPizzas fue cancelado. Si necesitas ayuda, escribenos.',
}


@dataclass
class NotificationDispatchResult:
    delivery_status: str
    provider: str
    message: str
    sent_at: str
    error: str = ''


def should_notify_status(order_status: str) -> bool:
    return order_status in STATUS_MESSAGES


def build_whatsapp_message(order: Order) -> str:
    template = STATUS_MESSAGES.get(order.status, '')
    if not template:
        return ''

    return template.format(
        receiver_name=order.receiver_name,
        total=order.total,
    )


def dispatch_whatsapp_notification(order: Order) -> NotificationDispatchResult:
    message = build_whatsapp_message(order)
    sent_at = datetime.now().isoformat()

    if not message:
        return NotificationDispatchResult(
            delivery_status='fallido',
            provider=WHATSAPP_PROVIDER,
            message='',
            sent_at=sent_at,
            error='No encontramos una plantilla para este estado.',
        )

    if WHATSAPP_MODE == 'disabled':
        return NotificationDispatchResult(
            delivery_status='pendiente',
            provider=WHATSAPP_PROVIDER,
            message=message,
            sent_at=sent_at,
        )

    # Mientras no conectemos Meta o Twilio, dejamos el flujo operativo en modo simulacion.
    return NotificationDispatchResult(
        delivery_status='simulado',
        provider=WHATSAPP_PROVIDER,
        message=message,
        sent_at=sent_at,
    )
