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


_matrix_client = None


def matrix_client():
    global _matrix_client
    if _matrix_client:
        return _matrix_client
    print(f"Signing into {MATRIX_HOST}...")
    client = MatrixClient(MATRIX_HOST)
    client.login_with_password(username=MATRIX_USER,
                               password=MATRIX_PASSWORD)
    _matrix_client = client
    return client


def event_is_image(event):
    return (event['type'] != 'm.room' and
            event['content'].get('msgtype') == 'm.image')


def get_room_events(room_id, count=100):
    """Iterate room events, starting at the cursor."""
    room = matrix_client().get_rooms()[room_id]
    print(f"Reading events from room {room.display_name!r}…")
    yield from room.events
    room.event_history_limit = len(room.events) + count
    batch_size = 1000  # empirically, this is the max accepted
    prev_batch = room.prev_batch
    while len(room.events) < count:
        # room.backfill_previous_messages(limit=batch_size)
        res = room.client.api.get_room_messages(room.room_id, prev_batch, 'b',
                                                limit=batch_size)
        events = res['chunk']
        if not events:
            break
        print(f"Got {len(events)} new events...")
        for event in events:
            room._put_event(event)
        yield from events
        prev_batch = res['start']


def get_room_image_events(room_id, count=100):
    skipped = 0
    for event in get_room_events(room_id, count):
        if event_is_image(event):
            yield event
        else:
            skipped += 1
            if not skipped % 100:
                print(f"Skipped {skipped} non-image events")


def save_new_image_events(room_id, count=100):
    # print(f"Skipping {len1 - len(events)} event images that were already saved")
    # print(f"Saving {len(events)} event images")
    saved, skipped = 0, 0
    for event in get_room_image_events(room_id, count):
        yield (saved, skipped)
        instance = Image.objects(event_id=event['event_id'], room_id=event['room_id'])
        if instance:
            skipped += 1
            continue
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
        saved += 1


def import_events_images(room_id, count=100):
    last_saved, last_skipped = 0, 0
    for saved_count, skipped_count in save_new_image_events(room_id, count):
        if saved_count > last_saved and saved_count % 100 == 0:
            print(f"Saved {saved_count} event images")
        if skipped_count > last_skipped and skipped_count % 100 == 0:
            print(f"Skipped {skipped_count} previously saved images")
        last_saved, last_skipped = saved_count, skipped_count
    print(f"Saved {saved_count} event images; skipped {skipped_count} previously saved")


@app.cli.command(name='import-events')
@click.option('--count', type=int, default=1000)
def import_events(count=300):
    """Load events."""
    for room_id in MATRIX_ROOM_IDS:
        import_events_images(room_id, count=count)
    print(f"The database now has {Image.objects.count()} images")


if __name__ == '__main__':
    import_events()
