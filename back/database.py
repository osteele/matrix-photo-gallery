import os

from mongoengine import connect

connect('dinacon', host=os.getenv('MONGODB_URI'))
