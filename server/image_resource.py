from urllib.parse import urlparse

from flask import current_app as app
from flask import request
from flask_restplus import Namespace, Resource, fields

from .schema import Image
from .thumbnails import SMALL_THUMBNAIL_DIR

api = Namespace('images')

model = api.model('App', {
    'room_id': fields.String(readonly=True),
    'event_id': fields.String(readonly=True),
    'sender': fields.String(readonly=True),
    'timestamp': fields.DateTime(readonly=True),
    'image_url': fields.String(readonly=True),
    'thumbnail_url': fields.String(readonly=True),
    'small_thumbnail_url': fields.String(readonly=True),
})


@api.route('/')
class Images(Resource):
    @api.marshal_with(model)
    def get(self):
        """List all the images."""
        images = Image.objects
        if app.config['SERVE_LOCAL_IMAGES']:
            use_local_thumbnails(images)
        return list(images)


def use_local_thumbnails(images):
    base = '//' + urlparse(request.url).netloc
    thumbnails = {p.name for p in SMALL_THUMBNAIL_DIR.glob('*')}
    for image in images:
        if image.small_thumbnail_url:
            name = image.small_thumbnail_url.split('/')[-1]
            if name in thumbnails:
                image.small_thumbnail_url = base + '/images/small-thumbnail/' + name
