import os
from datetime import datetime

import click
from matrix_client.client import MatrixClient

from .app import app
from .image_document import Image

MATRIX_USER = os.environ['MATRIX_USER']
MATRIX_PASSWORD = os.environ['MATRIX_PASSWORD']
MATRIX_HOST = os.environ.get('MATRIX_HOST', "https://matrix.org")
MATRIX_ROOM_IDS = os.environ['MATRIX_ROOM_IDS'].split(',')

client = None


def get_client():
    global client
    if client:
        return client
    print(f"Signing into {MATRIX_HOST}")
    client = MatrixClient(MATRIX_HOST)
    client.login_with_password(username=MATRIX_USER,
                               password=MATRIX_PASSWORD)
    return client


def event_is_image(event):
    return (event['type'] != 'm.room' and
            event['content'].get('msgtype') == 'm.image')


def get_room_events(room_id, count=100):
    room = get_client().get_rooms()[room_id]
    print(f"Reading events from room {room.display_name}…")
    room.event_history_limit = 100000
    n = len(room.events)
    while len(room.events) < count:
        room.backfill_previous_messages(limit=1000)
        if len(room.events) == count:
            break
        n = len(room.events)
        print(f"\t{n} events read…")
    print("  done.")
    return room.events


def get_room_image_events(room_id, count=100):
    return [event for event in get_room_events(room_id, count)
            if event_is_image(event)]


def save_new_image_events(events):
    print(f"Saving {len(events)} event images")
    len1 = len(events)
    events = [event for event in events
              if not Image.objects(event_id=event['event_id'],
                                   room_id=event['room_id'])]
    print(f"Skipping {len1 - len(events)} event images that were already saved")
    print(f"Saving {len(events)} event images")
    for event in events:
        content = event['content']
        fields = {
            'event_id': event['event_id'],
            'room_id': event['room_id'],
            'sender': event['sender'],
            'timestamp': datetime.fromtimestamp(event['origin_server_ts'] / 1000),
            'image_url': client.api.get_download_url(content['url']),
        }
        if 'thumbnail_url' in content['info']:
            fields['thumbnail_url'] = client.api.get_download_url(
                content['info']['thumbnail_url'])
        image = Image(**fields)
        image.save()


def import_events_images(room_id, count=100):
    save_new_image_events(get_room_image_events(room_id, count))


@app.cli.command(name='read-events')
@click.argument('count', type=int, default=1000)
def import_events(count=300):
    """Load events."""
    for room_id in MATRIX_ROOM_IDS:
        import_events_images(room_id, count=count)
    print(f"The database now has {Image.objects.count()} images")


if __name__ == '__main__':
    import_events()
