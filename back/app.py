from flask import Flask, render_template

from flask_cors import CORS
from flask_restplus import Api

from .image_resource import api as images_api

app = Flask(__name__)
CORS(app)


@app.route('/')
def splash():
    return render_template('splash.html')


api = Api(app, doc="/docs/", title="Matrix Image Gallery API", version="0.1")
api.add_namespace(images_api)
