@echo off
echo Starting Delivery Hub Pro...

REM Supabase configuration for local run
set "SUPABASE_URL=https://qhyjrqslnrbzejbbpifz.supabase.co"
set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoeWpycXNsbnJiZXpqYmJwaWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTQxNjYsImV4cCI6MjA4MDMzMDE2Nn0.lINHcbdzUupmoJuUCfQwY4h76_JamVTV6CdLEiw2xVM"
set "VITE_SUPABASE_URL=https://qhyjrqslnrbzejbbpifz.supabase.co"
set "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoeWpycXNsbnJiZXpqYmJwaWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTQxNjYsImV4cCI6MjA4MDMzMDE2Nn0.lINHcbdzUupmoJuUCfQwY4h76_JamVTV6CdLEiw2xVM"

echo Starting Backend Server on Port 4000...
start "Backend Server" /min cmd /k "cd server && npm start"

echo Waiting for backend...
timeout /t 5 /nobreak >nul

echo Starting Frontend Client on Port 8083...
start "Frontend Client" cmd /k "npm run dev"

echo.
echo Application launching...
echo If the browser does not open, please visit: http://127.0.0.1:8083
pause
