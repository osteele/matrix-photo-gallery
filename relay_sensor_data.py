import json
import os
import re

import requests

import serial.tools.list_ports

SENSOR_SERVER_NETLOC = os.environ.get('SENSOR_SERVER_NETLOC', '127.0.0.1:5000')

port = next(p for p in serial.tools.list_ports.comports()
            if p.pid == 516 and p.vid == 3368)
print(f"Listening on USB {port}")

ser = serial.Serial(port.device)
ser.baudrate = 115200
while True:
    line = ser.readline().decode()
    m = re.match(r'(\w+)=(-?\d+)', line)
    if m:
        key, value = m.groups()
        key = key.lower()
        print(f'{key}={value}')
        try:
            requests.post(f'http://{SENSOR_SERVER_NETLOC}/sensor', data=json.dumps({key: value}))
        except requests.exceptions.ConnectionError as err:
            print(err)
    else:
        print('unmatched', line.strip())
