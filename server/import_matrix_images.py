import os
from datetime import datetime
from itertools import islice

import click

from .app import app
from .matrix_connection import matrix_client
from .schema import Image

MATRIX_ROOM_IDS = os.environ['MATRIX_ROOM_IDS'].split(',')


def is_image_event(event):
    return event['type'] != 'm.room' and \
        event['content'].get('msgtype') == 'm.image'


def iter_room_events(room_id):
    """Iterate room events, starting at the cursor."""
    room = matrix_client().get_rooms()[room_id]
    print(f"Reading events from room {room.display_name!r}…")
    yield from room.events
    batch_size = 1000  # empirically, this is the max accepted
    prev_batch = room.prev_batch
    while True:
        res = room.client.api.get_room_messages(
            room.room_id, prev_batch, 'b', limit=batch_size)
        events = res['chunk']
        if not events:
            break
        print(f"Read {len(events)} events...")
        yield from events
        prev_batch = res['end']


def save_new_image_events(room_id, limit=None):
    image_keys = {(image.room_id, image.event_id) for image in Image.objects}
    events = filter(is_image_event, iter_room_events(room_id))
    events = (event for event in events
              if (event['room_id'], event['event_id']) not in image_keys)
    if limit:
        events = islice(events, limit)
    for event in events:
        content = event['content']
        fields = {
            'event_id': event['event_id'],
            'room_id': event['room_id'],
            'sender': event['sender'],
            'timestamp': datetime.fromtimestamp(event['origin_server_ts'] / 1000),
            'image_url': matrix_client().api.get_download_url(content['url']),
        }
        if 'thumbnail_url' in content['info']:
            fields['thumbnail_url'] = matrix_client().api.get_download_url(
                content['info']['thumbnail_url'])
        image = Image(**fields)
        image.save()
        yield image


def import_event_images(room_id, limit=100):
    saved_count = 0
    for image in save_new_image_events(room_id, limit):
        saved_count += 1
        if saved_count % 100 == 0:
            print(f"Saved {saved_count} images")
    if saved_count:
        print(f"Saved {saved_count} new images")


@app.cli.command(name='import-images')
@click.option('--limit', type=int, default=1000)
def import_images(limit):
    """Import images from the Matrix rooms in MATRIX_ROOM_IDS."""
    for room_id in MATRIX_ROOM_IDS:
        import_event_images(room_id, limit=limit)
    print(f"The database now has {Image.objects.count()} images")


if __name__ == '__main__':
    import_images()
