start "Redis" cmd /k "wsl -e redis-server"
@REM adding a delay to ensure redis-server is ready before running things that depend on it
timeout /t 3 /nobreak
start "Django" cmd /k "cd /d %~dp0 && venv\Scripts\activate && python manage.py runserver"
start "Celery Worker" cmd /k "cd /d %~dp0 && venv\Scripts\activate && celery -A backend worker --loglevel=info --pool=solo"
start "Celery Beat" cmd /k "cd /d %~dp0 && venv\Scripts\activate && celery -A backend beat --loglevel=info"