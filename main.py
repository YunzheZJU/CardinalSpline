# -*- coding: utf-8 -*-
from flask import Flask, request, session, g, redirect, url_for, abort, render_template

app = Flask(__name__)


@app.route('/', methods=['GET'])
def demo():
    return render_template('Demo.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
