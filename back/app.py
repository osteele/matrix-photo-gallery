import os

import gevent
import redis
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from flask_restplus import Api
from flask_sockets import Sockets
from geventwebsocket.exceptions import WebSocketError

from .image_resource import api as images_api
from .thumbnails import SMALL_THUMBNAIL_DIR

app = Flask(__name__)
app.config["SERVE_LOCAL_IMAGES"] = os.environ.get("SERVE_LOCAL_IMAGES")
CORS(app)

sockets = Sockets(app)

REDIS_URL = os.environ.get("REDIS_URL")
if REDIS_URL:
    redis_conn = redis.StrictRedis.from_url(REDIS_URL)


@app.route("/")
def splash():
    return render_template("splash.html")


if app.config["SERVE_LOCAL_IMAGES"]:

    @app.route("/images/small-thumbnail/<path:filename>")
    def thumbnail(filename):
        return send_from_directory(str(SMALL_THUMBNAIL_DIR), str(filename))


REDIS_CHAN = "sensor_data"


@sockets.route("/sensor_data")
def sensor_data_route(ws):
    def publish():
        while not ws.closed:
            data = ws.receive()
            if data:
                # print(ws, "publish", data, type(data))
                redis_conn.publish(REDIS_CHAN, data)

    def subscribe():
        pubsub = redis_conn.pubsub()
        pubsub.subscribe(REDIS_CHAN)
        for message in pubsub.listen():
            if message["type"] == "message":
                data = message.get("data")
                # print(ws, "send", data, type(data))
                try:
                    ws.send(data.decode())
                except WebSocketError:
                    return

    gevent.spawn(subscribe)
    publish()


api = Api(app, doc="/docs/", title="Matrix Image Gallery API", version="0.1")
api.add_namespace(images_api)
