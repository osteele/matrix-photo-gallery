from mongoengine import DateTimeField, Document, StringField, URLField


class Image(Document):
    room_id = StringField(required=True)
    event_id = StringField(required=True, unique_with='room_id')
    sender = StringField(required=True)
    timestamp = DateTimeField(required=True)
    thumbnail_url = URLField()
    image_url = URLField(required=True)
