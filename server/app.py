import os

from flask import Flask, render_template, send_file, send_from_directory
from flask_cors import CORS
from flask_restplus import Api

from .image_resource import api as images_api
from .thumbnails import SMALL_THUMBNAIL_DIR

app = Flask(__name__)
CORS(app)

app.config['SERVE_LOCAL_IMAGES'] = os.environ.get('SERVE_LOCAL_IMAGES')


@app.route('/')
def splash():
    return render_template('splash.html')


if app.config['SERVE_LOCAL_IMAGES']:
    @app.route('/images/small-thumbnail/<path:filename>')
    def thumbnail(filename):
        return send_from_directory(str(SMALL_THUMBNAIL_DIR), str(filename))


api = Api(app, doc="/docs/", title="Matrix Image Gallery API", version="0.1")
api.add_namespace(images_api)
