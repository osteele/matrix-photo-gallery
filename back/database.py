import os
import re

from mongoengine import connect

MONGODB_URI = os.getenv('MONGODB_URI')
MONGO_RE = r'mongodb://(?P<username>.+?):(?P<password>.+?)@(?P<host>(?:.+?):(?:\d+))/(?P<db>.+)'

if MONGODB_URI:
    connect_args = re.match(MONGO_RE, MONGODB_URI).groupdict()
    connect(**connect_args)
else:
    connect('dinacon')
