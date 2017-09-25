@echo off
set FLASK_APP=main.py
set FLASK_DEBUG=1
start flask run --host=127.0.0.1 --port=8080
exit