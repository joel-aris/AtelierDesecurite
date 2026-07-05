# SECURE OFFICE

Application cybersécurité avec frontend React/Vite et backend Laravel API.

## Lancement local

Base obligatoire: PostgreSQL. SQLite n'est pas utilisé.

```bash
docker compose up -d
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Pour activer la vérification des fuites par email, renseigner `HIBP_API_KEY` dans `backend/.env`.

Si Docker n'a pas accès au socket sur ta machine, démarre le cluster PostgreSQL local :

```bash
sudo pg_ctlcluster 18 main start
sudo -u postgres psql -c "CREATE USER secure_office WITH PASSWORD 'secure_office';"
sudo -u postgres psql -c "CREATE DATABASE secure_office OWNER secure_office;"
cd backend
sed -i 's/DB_PORT=55432/DB_PORT=5432/' .env
php artisan migrate --seed
php artisan serve
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Comptes de test:

- admin: `admin@secure-office.test` / `password`
- user: `user@secure-office.test` / `password`

Le site reste utilisable sans connexion. Les actions invitées sont associées à un identifiant local envoyé via `X-Guest-Id`; après connexion, l’historique est conservé côté compte.
