import json
import os
from datetime import datetime

from flask import Flask, jsonify, render_template, request, send_from_directory
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

sensor_data = {}
sensor_data_timestamp = None

@app.route('/sensor', methods=['GET', 'POST'])
def sensor_data_route():
    global sensor_data, sensor_data_timestamp
    if request.method == 'POST':
        # sensor_data = request.get_json()
        sensor_data.update(json.loads(request.data))
        sensor_data_timestamp = datetime.now()
        print('data:', sensor_data)
    if sensor_data:
        sensor_data['age'] = (datetime.now() - sensor_data_timestamp).total_seconds()
    return jsonify(sensor_data)


api = Api(app, doc="/docs/", title="Matrix Image Gallery API", version="0.1")
api.add_namespace(images_api)
