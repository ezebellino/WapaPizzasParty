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

STATUS_MESSAGES = {
    'procesado': 'Hola {receiver_name}, tu pedido de WapaPizzas ya fue procesado. Total: ${total}.',
    'en_preparacion': 'Hola {receiver_name}, tu pedido de WapaPizzas ya esta en preparacion.',
    'listo_para_retirar': 'Hola {receiver_name}, tu pedido de WapaPizzas esta listo para retirar. Puedes pasar a buscarlo.',
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


def build_whatsapp_message(order: Order) -> str:
    template = STATUS_MESSAGES.get(order.status, '')
    if not template:
        return ''

    return template.format(
        receiver_name=order.receiver_name,
        total=order.total,
    )


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
