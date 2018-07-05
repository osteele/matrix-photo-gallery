import re
import requests
import serial.tools.list_ports
import json

port = next(p for p in serial.tools.list_ports.comports()
            if p.pid == 516 and p.vid == 3368)

print(port)

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
            requests.post('http://127.0.0.1:5000/sensor', data=json.dumps({key: value}))
        except requests.exceptions.ConnectionError as err:
            print(err)
    else:
        print('unmatched', line.strip())
