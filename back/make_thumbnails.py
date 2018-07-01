import mimetypes
import os
from pathlib import Path

import boto3
import PIL  # import Image

from .app import app
from .schema import Image

CACHE_DIR = Path('.cache')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
BUCKET_PREFIX = os.environ.get('BUCKET_PREFIX', 'gallery/')


def filesize(path):
    return Path(path).stat().st_size


def s3_client():
    return boto3.client('s3')


def iter_bucket_objects():
    marker = None
    while True:
        response = s3_client().list_objects(Bucket=BUCKET_NAME,
                                            Prefix=BUCKET_PREFIX,
                                            **(dict(Marker=marker) if marker else {}))
        assert response['ResponseMetadata']['HTTPStatusCode'] == 200
        yield from response.get('Contents', [])
        if not response['IsTruncated']:
            break
        marker = response['Marker']


def create_bucket():
    assert BUCKET_NAME, 'BUCKET_NAME is not defined'
    response = s3_client().create_bucket(ACL='public-read', Bucket=BUCKET_NAME)
    assert response['ResponseMetadata']['HTTPStatusCode'] == 200


def upload_file(path, key=None):
    assert key, "key is a required parameter"
    mimetype, _ = mimetypes.guess_type(path.name)
    assert mimetype, f"Can't guess MIME type from {path}"
    response = s3_client().put_object(Bucket=BUCKET_NAME,
                                      Key=key,
                                      ACL='public-read',
                                      Body=path.read_bytes(),
                                      ContentType=mimetype,
                                      )
    assert response['ResponseMetadata']['HTTPStatusCode'] == 200


@app.cli.command()
def make_thumbnails():
    create_bucket()
    s3_object_keys = {obj['Key'] for obj in iter_bucket_objects()}
    # print('Already uploaded:', s3_object_keys)
    images = [img for img in Image.objects if not img.small_thumbnail_url]
    thumbnail_dir = CACHE_DIR / 'thumbnails'
    output_dir = CACHE_DIR / 'small_thumbnails'
    output_dir.mkdir(exist_ok=True)
    for image in images:
        stem = (image.thumbnail_url or image.image_url).split('/')[-1]
        files = list(thumbnail_dir.glob(stem + '.*'))
        if not files:
            print(f"No local thumbnail for {stem}; skipping")
            continue
        assert len(files) == 1, "More than one file matches {stem}: {files}"
        infile = Path(files[0])
        outfile = (output_dir / stem).with_suffix(infile.suffix)
        s3_key = BUCKET_PREFIX + outfile.name
        small_thumbnail_url = ''.join(
            ['http://', BUCKET_NAME, '.s3.amazonaws.com/', s3_key])
        if s3_key not in s3_object_keys:
            if not outfile.exists():
                im = PIL.Image.open(infile)
                im.thumbnail((400, 400))
                im.save(outfile)
                print(f"Thumbnail {infile.name}: "
                      f"{filesize(infile)} -> {filesize(outfile)}")
            print(f"Uploading {s3_key}")
            upload_file(outfile, key=s3_key)
        image.small_thumbnail_url = small_thumbnail_url
        image.save()


if __name__ == '__main__':
    make_thumbnails()
