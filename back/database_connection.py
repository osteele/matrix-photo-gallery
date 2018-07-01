import os
import re

from mongoengine import connect

MONGODB_URI = os.getenv('MONGODB_URI')
MONGO_CONNECTION_RE = re.compile(
    r'mongodb://'
    r'(?P<username>.+?)'
    r':(?P<password>.+?)'
    r'@(?P<host>(?:.+?):(?:\d+))'
    r'/(?P<db>.+)')


def parse_mongo_connection_uri(uri):
    return MONGO_CONNECTION_RE.match(uri).groupdict()


if MONGODB_URI:
    print(f"Connecting to {MONGODB_URI}")
    connect(**parse_mongo_connection_uri(MONGODB_URI))
else:
    connect('dinacon')
