import base64
import os
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from .schemas import Order


load_dotenv(Path(__file__).resolve().parents[1] / '.env')

WHATSAPP_MODE = os.getenv('WHATSAPP_MODE', 'mock').strip().lower()
WHATSAPP_PROVIDER = os.getenv('WHATSAPP_PROVIDER', 'mock').strip().lower()
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '').strip()
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '').strip()
TWILIO_WHATSAPP_FROM = os.getenv('TWILIO_WHATSAPP_FROM', '').strip()
TWILIO_STATUS_CALLBACK_URL = os.getenv('TWILIO_STATUS_CALLBACK_URL', '').strip()
BUSINESS_PHONE = os.getenv('WAPA_BUSINESS_PHONE', '2245509530').strip()
BUSINESS_INSTAGRAM = os.getenv('WAPA_INSTAGRAM', 'https://www.instagram.com/wapapizzaparty').strip()
BUSINESS_FACEBOOK = os.getenv('WAPA_FACEBOOK', 'https://www.facebook.com/SoleMoranWapaPizzaParty').strip()

STATUS_MESSAGES = {
    'procesado': 'Hola {receiver_name}, tu pedido en WapaPizzas fue procesado.',
    'en_preparacion': 'Hola {receiver_name}, tu pedido en WapaPizzas ya esta en preparacion.',
    'listo_para_retirar': 'Hola {receiver_name}, tu pedido en WapaPizzas esta listo para retirar.',
    'entregado': 'Hola {receiver_name}, gracias por tu compra en WapaPizzas.',
    'cancelado': 'Hola {receiver_name}, tu pedido en WapaPizzas fue cancelado. Si necesitas ayuda, escribenos.',
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


def normalize_phone_number(phone: str) -> str:
    digits = ''.join(character for character in phone if character.isdigit())
    if not digits:
        raise ValueError('Ingresa un telefono valido para enviar WhatsApp.')

    if digits.startswith('00'):
        digits = digits[2:]

    if digits.startswith('549'):
        return f'+{digits}'

    if digits.startswith('54'):
        return f'+{digits}'

    if digits.startswith('9') and len(digits) >= 11:
        return f'+54{digits}'

    if digits.startswith('11') and len(digits) == 10:
        return f'+549{digits}'

    if digits.startswith('0'):
        digits = digits[1:]

    if len(digits) >= 10:
        return f'+54{digits}'

    raise ValueError('Ingresa un telefono con codigo de area valido para enviar WhatsApp.')


def format_currency(value: int) -> str:
    formatted = f'{value:,.0f}'
    return formatted.replace(',', '.')


def format_quantity(value: float) -> str:
    normalized = round(value * 2) / 2
    if abs(normalized - 0.5) < 1e-9:
        return '1/2 pizza'
    if abs(normalized - round(normalized)) < 1e-9:
        whole = int(round(normalized))
        return f'{whole} pizza' if whole == 1 else f'{whole} pizzas'

    whole = int(normalized)
    return f'{whole} 1/2 pizzas'


def build_order_lines(order: Order) -> list[str]:
    return [
        f"- {format_quantity(item.quantity)} de {item.name}: ${format_currency(round(item.price * item.quantity))}"
        for item in order.sales
    ]


def build_whatsapp_message(order: Order) -> str:
    template = STATUS_MESSAGES.get(order.status, '')
    if not template:
        return ''

    intro = template.format(receiver_name=order.receiver_name)
    order_lines = '\n'.join(build_order_lines(order))
    shipping_label = f"${format_currency(order.shipping_cost)}" if order.include_shipping else '$0'
    notes_line = f"Observaciones: {order.notes}" if order.notes else 'Observaciones: Sin observaciones.'
    pickup_hint = 'Puedes retirarlo coordinando con WapaPizzas.' if order.status == 'listo_para_retirar' else ''

    message_parts = [
        intro,
        '',
        'Comprobante de pedido',
        f"Pedido: {order.order_id}",
        f"Cliente: {order.receiver_name}",
        f"Telefono: {order.receiver_phone or 'No informado'}",
        f"Medio de pago: {order.payment_method.replace('_', ' ')}",
        '',
        'Detalle:',
        order_lines,
        '',
        f"Subtotal: ${format_currency(order.subtotal)}",
        f"Envio: {shipping_label}",
        f"Total: ${format_currency(order.total)}",
        notes_line,
    ]

    if pickup_hint:
        message_parts.extend(['', pickup_hint])

    message_parts.extend([
        '',
        'Siguenos y contactanos:',
        f"WhatsApp WapaPizzas: {BUSINESS_PHONE}",
        f"Instagram: {BUSINESS_INSTAGRAM}",
        f"Facebook: {BUSINESS_FACEBOOK}",
    ])

    return '\n'.join(part for part in message_parts if part is not None)


def dispatch_mock_notification(order: Order, message: str, sent_at: str) -> NotificationDispatchResult:
    return NotificationDispatchResult(
        delivery_status='simulado',
        provider=WHATSAPP_PROVIDER,
        message=message,
        sent_at=sent_at,
    )


def dispatch_twilio_notification(order: Order, message: str, sent_at: str) -> NotificationDispatchResult:
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_WHATSAPP_FROM:
        return NotificationDispatchResult(
            delivery_status='fallido',
            provider='twilio',
            message=message,
            sent_at=sent_at,
            error='Faltan credenciales de Twilio para WhatsApp.',
        )

    try:
        to_number = normalize_phone_number(order.receiver_phone)
    except ValueError as error:
        return NotificationDispatchResult(
            delivery_status='fallido',
            provider='twilio',
            message=message,
            sent_at=sent_at,
            error=str(error),
        )

    payload = {
        'To': f'whatsapp:{to_number}',
        'From': TWILIO_WHATSAPP_FROM,
        'Body': message,
    }

    if TWILIO_STATUS_CALLBACK_URL:
        payload['StatusCallback'] = TWILIO_STATUS_CALLBACK_URL

    encoded_payload = urllib.parse.urlencode(payload).encode('utf-8')
    endpoint = f'https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json'
    request = urllib.request.Request(endpoint, data=encoded_payload, method='POST')
    request.add_header('Content-Type', 'application/x-www-form-urlencoded')

    credentials = f'{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}'.encode('utf-8')
    request.add_header('Authorization', f'Basic {base64.b64encode(credentials).decode("ascii")}')

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if 200 <= response.status < 300:
                return NotificationDispatchResult(
                    delivery_status='enviado',
                    provider='twilio',
                    message=message,
                    sent_at=sent_at,
                )

            return NotificationDispatchResult(
                delivery_status='fallido',
                provider='twilio',
                message=message,
                sent_at=sent_at,
                error=f'Twilio respondio con estado {response.status}.',
            )
    except urllib.error.HTTPError as error:
        response_body = error.read().decode('utf-8', errors='ignore')
        return NotificationDispatchResult(
            delivery_status='fallido',
            provider='twilio',
            message=message,
            sent_at=sent_at,
            error=response_body or f'Twilio respondio con estado {error.code}.',
        )
    except urllib.error.URLError as error:
        return NotificationDispatchResult(
            delivery_status='fallido',
            provider='twilio',
            message=message,
            sent_at=sent_at,
            error=f'No pudimos conectar con Twilio: {error.reason}',
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

    if WHATSAPP_MODE == 'live' and WHATSAPP_PROVIDER == 'twilio':
        return dispatch_twilio_notification(order, message, sent_at)

    return dispatch_mock_notification(order, message, sent_at)
