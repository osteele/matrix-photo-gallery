# Matrix Photo Gallery

A photo gallery for photos from a Matrix room.

This project is being developed as a platform for photo visualization
experiments at [Dinacon 2018](https://www.dinacon.org).

![](./docs/screenshot.png)

## Develop

### Setup

Install Pipenv. Run `pipenv install`.

Set these environment variables: `MATRIX_USER`, `MATRIX_PASSWORD`,
`MATRIX_ROOM_IDS`.

`MATRIX_ROOM_IDS` should be a comma-separated list of Matrix room IDs (or a
single id). Run `pipenv run list_rooms.py` to list the room ids.

Set `MONGODB_URI` to a MongoDB connection URL, *or* install a local MongoDB
instance.

`pipenv run import-images` imports images from Matrix events.

Optional: `pipenv run make-small-thumbnails` creates smaller thumbnails than the
Matrix thumbnails — which are still pretty large — and uploads them to the S3
bucket named `BUCKET_NAME`.

### Run

Run the back end (server):

```shell
$ pipenv run server
```

or:

```shell
env FLASK_APP=server:app FLASK_ENV=development flask run
```

Run the front end (client):

```shell
$ pipenv run client
```

or:

```shell
$ cd client
$ yarn install
$ yarn start
```

If `SERVE_LOCAL_IMAGES` is set *and* `pipenv run make-small-thumbnails` has been
run, the server will direct the client to use small thumbnail images from the
local filesystem. This is intended for use in local development.

## Related

This repository originally held the Tidal Memories exhibit piece, that now lives
at <https://github.com/osteele/tidal-memories>. As an experiment, and in order
to simplify this repository back to just a Riot image gallery, I've used `git
filter-branch` to unwind the changes for that piece from this repo. The original
history is in the `original` branch of this repo.

## License

MIT
