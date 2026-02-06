# Деплой Builders на сервер 89.104.94.148 (стройка.website)

Этот гайд содержит готовые команды. Просто копируйте их в терминал.

## 1. Подготовка

**На вашем компьютере** (где лежит проект):
Откройте PowerShell и скопируйте проект на сервер:
```powershell
# Замените 'root' на имя пользователя вашего сервера, если оно другое
scp -r "e:\Projects MAIN\Builders\*" root@89.104.94.148:/var/www/builders/
```

**На сервере** (подключитесь через SSH):
```bash
ssh root@89.104.94.148
```

---

## 2. Установка зависимостей (на сервере)

Выполните блок команд целиком:
```bash
# Обновление и установка Node.js 20, Nginx, Git, Certbot
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx postgresql postgresql-contrib
sudo npm install -g pm2
```

---

## 3. Настройка Базы Данных

1. Войдите в Postgres console:
```bash
sudo -u postgres psql
```

2. Скопируйте SQL команды (замените `ПРИДУМАЙТЕ_ПАРОЛЬ` на ваш пароль):
```sql
CREATE USER builders_user WITH PASSWORD 'ПРИДУМАЙТЕ_ПАРОЛЬ';
CREATE DATABASE builders OWNER builders_user;
GRANT ALL PRIVILEGES ON DATABASE builders TO builders_user;
\q
```

---

## 4. Настройка Backend

```bash
# Переходим в папку бэкенда
cd /var/www/builders/backend

# Ставим зависимости
npm install

# Создаем .env файл
nano .env
```

**Вставьте в nano (CTRL+V), заменив `ПРИДУМАЙТЕ_ПАРОЛЬ`:**
```env
DATABASE_URL="postgresql://builders_user:ПРИДУМАЙТЕ_ПАРОЛЬ@localhost:5432/builders"
JWT_SECRET="slkdfjlsdkfj309485039485039485039485sdklfjsldkfj"
PORT=3001
NODE_ENV=production
```
*(Нажмите `Ctrl+X`, затем `Y`, затем `Enter` для сохранения)*

**Запуск:**
```bash
# Миграции и сборка
npx prisma db push
npx prisma generate
npm run build
```

---

## 5. Настройка Frontend

```bash
cd /var/www/builders/Folder\ 2
# Если папка называется просто frontend, используйте: cd /var/www/builders/frontend

# Ставим зависимости
npm install

# Создаем конфиг для продакшена
nano .env.production
```

**Вставьте содержимое:**
```env
VITE_API_URL=https://xn--80ardojfh.website/api
```
*(Сохраните: `Ctrl+X`, `Y`, `Enter`)*

**Сборка:**
```bash
npm run build
```

---

## 6. Запуск через PM2

```bash
cd /var/www/builders/backend

# Запускаем сервер
pm2 start dist/main.js --name builders-api --env production

# Сохраняем для автозапуска
pm2 startup
pm2 save
```

---

## 7. Настройка Nginx (стройка.website)

```bash
sudo nano /etc/nginx/sites-available/builders
```

**Вставьте конфиг:**
```nginx
server {
    listen 80;
    server_name xn--80ardojfh.website www.xn--80ardojfh.website 89.104.94.148;

    # Убедитесь что путь правильный!
    # Если у вас папка "Folder 2", путь будет с кавычками или экранированием, но в Nginx лучше переименовать папку.
    # ДЛЯ ПРОСТОТЫ: Давайте сделаем симлинк, выполните команду ниже после настройки Nginx
    root /var/www/builders/frontend_dist;
    
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Примените настройки:**

```bash
# Создаем симлинк для папки дистрибутива (чтобы не мучиться с пробелами в Folder 2)
ln -s "/var/www/builders/Folder 2/dist" /var/www/builders/frontend_dist

# Активируем сайт
sudo ln -s /etc/nginx/sites-available/builders /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Проверяем и перезапускаем
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL Сертификат

```bash
sudo certbot --nginx -d xn--80ardojfh.website -d www.xn--80ardojfh.website
```
*(Если спросит, введите Email и выберите 2 для редиректа)*

---

## 9. DNS (На сайте регистратора домена)

Добавьте **A-запись**:
*   **Имя:** `@`
*   **Значение:** `89.104.94.148`
