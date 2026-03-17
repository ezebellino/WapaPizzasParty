import argparse
import json
from pathlib import Path

from app.auth import hash_password


ROOT = Path(__file__).resolve().parents[1]
USERS_FILE = ROOT / 'app' / 'users.json'


def load_users() -> list[dict]:
    if not USERS_FILE.exists():
        return []

    return json.loads(USERS_FILE.read_text(encoding='utf-8'))


def save_users(users: list[dict]) -> None:
    USERS_FILE.write_text(
        json.dumps(users, indent=4, ensure_ascii=False),
        encoding='utf-8',
    )


def main() -> None:
    parser = argparse.ArgumentParser(description='Crear usuario para WapaPizzasParty.')
    parser.add_argument('--username', required=True)
    parser.add_argument('--name', required=True)
    parser.add_argument('--role', required=True, choices=['admin', 'operator'])
    parser.add_argument('--password', required=True)
    args = parser.parse_args()

    users = load_users()
    if any(user['username'] == args.username for user in users):
        raise SystemExit('Ya existe un usuario con ese username.')

    next_id = max((user['id'] for user in users), default=0) + 1
    users.append(
        {
            'id': next_id,
            'name': args.name,
            'username': args.username,
            'role': args.role,
            'is_active': True,
            'password_hash': hash_password(args.password),
        }
    )
    save_users(users)
    print(f'Usuario {args.username} creado con rol {args.role}.')


if __name__ == '__main__':
    main()
