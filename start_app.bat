
@echo off
echo Starting Builders Marketplace Application...

echo Starting Backend Server...
start "Builders Backend" cmd /k "cd backend && npm run start:dev"

echo Starting Frontend Application...
start "Builders Frontend" cmd /k "cd Folder 2 && npm run dev"

echo All services started!
echo Frontend will be available at http://localhost:5173
echo Backend will be available at http://localhost:3000
pause
