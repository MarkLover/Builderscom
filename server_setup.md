
# 🚀 Настройка Ubuntu Server для Builders App

Выполните эти команды по очереди на вашем сервере (подключившись через SSH).

## 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Установка Node.js (версия 20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
*Проверка:* `node -v` (должно быть v20.x.x)

## 3. Установка базы данных PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```
**Настройка пароля и базы:**
1. Заходим в Postgres:
   ```bash
   sudo -u postgres psql
   ```
2. Внутри консоли вводим команды (меняем пароль на свой!):
   ```sql
   CREATE DATABASE builders;
   CREATE USER admin WITH ENCRYPTED PASSWORD 'ВашНадежныйПароль';
   GRANT ALL PRIVILEGES ON DATABASE builders TO admin;
   \q
   ```

## 4. Установка Nginx (Веб-сервер)
```bash
sudo apt install -y nginx
```

## 5. Установка Git и PM2 (Менеджер процессов)
```bash
sudo apt install -y git
sudo npm install -g pm2
```
