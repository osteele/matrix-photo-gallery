from flask_restplus import Namespace, Resource, fields

from .schema import Image

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
        return list(Image.objects.all())
