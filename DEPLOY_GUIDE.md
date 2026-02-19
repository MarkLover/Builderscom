# Деплой Builders на сервер 89.104.94.148 (через GitHub)

Подключитесь к серверу через SSH: `ssh root@89.104.94.148`

## 1. Установка зависимостей (на сервере)

Выполните блок команд целиком (копируйте и вставляйте):
```bash
# Обновление и установка Node.js 20, Nginx, Git, Certbot, PostgreSQL
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx postgresql postgresql-contrib
sudo npm install -g pm2
```

---

## 2. Настройка Базы Данных

1. Войдите в Postgres console:
```bash
sudo -u postgres psql
```

2. Вставьте SQL команды (Пароль уже прописан):
```sql
CREATE USER builders_user WITH PASSWORD 'BuildersStrongPass2026!';
CREATE DATABASE builders OWNER builders_user;
GRANT ALL PRIVILEGES ON DATABASE builders TO builders_user;
\q
```

---

## 3. Скачивание проекта (GitHub)

```bash
# Создаем папку
sudo mkdir -p /var/www/builders
sudo chown -R $USER:$USER /var/www/builders

# Клонируем репозиторий
git clone https://github.com/MarkLover/Builderscom.git /var/www/builders
```

---

## 4. Настройка Backend (и секретов)

```bash
cd /var/www/builders/backend
npm install

# === СОЗДАЕМ СЕКРЕТНЫЙ ФАЙЛ ===
nano .env
```

**Вставьте это в редактор nano (Пароль совпадает с БД):**
```env
DATABASE_URL="postgresql://builders_user:BuildersStrongPass2026!@localhost:5432/builders"
JWT_SECRET="slkdfjlsdkfj309485039485039485039485sdklfjsldkfj"
PORT=3001
NODE_ENV=production
```
*(Чтобы сохранить: Ctrl+X, потом Y, потом Enter)*

**Запуск:**
```bash
npx prisma db push
npx prisma generate
npm run build
```

---

## 5. Настройка Frontend (и секретов)

```bash
cd /var/www/builders/Folder\ 2
# Или: cd /var/www/builders/frontend

npm install

# === СОЗДАЕМ CONFIG ДЛЯ ПРОДАКШЕНА ===
nano .env.production
```

**Вставьте это:**
```env
VITE_API_URL=https://xn--80ardojfh.website/api
```
*(Сохранить: Ctrl+X, Y, Enter)*

**Сборка:**
```bash
npm run build
```

---

## 6. Запуск (PM2)

```bash
cd /var/www/builders/backend

# Запускаем
pm2 start dist/main.js --name builders-api --env production

# Сохраняем автозапуск
pm2 startup
pm2 save
```

---

## 7. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/builders
```

**Вставьте конфиг:**
```nginx
server {
    listen 80;
    server_name xn--80ardojfh.website www.xn--80ardojfh.website 89.104.94.148;

    # Симлинк создадим ниже
    root /var/www/builders/frontend_dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Применяем:**
```bash
# Делаем симлинк для папки dist (чтобы обойти пробел в названии Folder 2)
ln -s "/var/www/builders/Folder 2/dist" /var/www/builders/frontend_dist

# Включаем сайт
sudo ln -s /etc/nginx/sites-available/builders /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Проверка и рестарт
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL (HTTPS)

```bash
# Получаем сертификат (выберите 2 - Redirect, если спросит)
sudo certbot --nginx -d xn--80ardojfh.website -d www.xn--80ardojfh.website
```

---

## 9. Обновление в будущемяЁЙЙЙЙЙЯ

```bash
cd /var/www/builders
git pull

# Если меняли бэкенд:
cd backend
npm install
npx prisma db push    # Применить изменения схемы БД
npx prisma generate   # Перегенерировать клиент
npm run build
pm2 restart builders-api

# Если меняли фронтенд:
cd ../Folder\ 2
npm install
npm run build
```

---

## 10. GitHub Secrets (для CI/CD)

Если вы используете GitHub Actions для автодеплоя, добавьте секреты:

**GitHub → Репозиторий → Settings → Secrets and variables → Actions → New repository secret**

| Название секрета | Значение |
|------------------|----------|
| `DATABASE_URL` | `postgresql://builders_user:BuildersStrongPass2026!@localhost:5432/builders` |
| `JWT_SECRET` | (ваш секретный ключ) |
| `SSH_HOST` | `89.104.94.148` |
| `SSH_USER` | `root` |
| `SSH_KEY` | (содержимое приватного SSH ключа) |

> ⚠️ **Важно**: Никогда не коммитьте `.env` файл в репозиторий!

---

## 11. Новые API Endpoints

После обновления доступны новые endpoints:

### Коммерческие предложения (КП)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/commercial-offers` | Создать КП |
| GET | `/commercial-offers` | Список КП |
| GET | `/commercial-offers/:id` | Детали КП |
| DELETE | `/commercial-offers/:id` | Удалить КП |
| POST | `/commercial-offers/:offerId/rooms` | Добавить комнату |
| DELETE | `/commercial-offers/rooms/:roomId` | Удалить комнату |
| POST | `/commercial-offers/rooms/:roomId/works` | Добавить работу |
| DELETE | `/commercial-offers/works/:workId` | Удалить работу |
| POST | `/commercial-offers/rooms/:roomId/materials` | Добавить материал |
| DELETE | `/commercial-offers/materials/:materialId` | Удалить материал |

### Подписки
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/subscriptions/status` | Статус подписки |
| POST | `/subscriptions/activate` | Активировать подписку |
| POST | `/subscriptions/deactivate` | Деактивировать подписку |
