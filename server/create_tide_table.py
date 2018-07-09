import json
from datetime import datetime
from pathlib import Path

import click

import lxml.cssselect  # noqa: F401
import pandas
import requests
from lxml import etree, html

from .app import app

TABLE_URL = "http://asia-marine.net/cruising-guide-tidetable/{}/"
# Could also use http://aopograndmarina.com/tide-tables-{}/


def get_tide_table(year, month):
    url = TABLE_URL.format(datetime(year, month, 1).strftime("%B-%Y").lower())
    print(f"Requesting {url}")
    page = requests.get(url)
    tree = html.fromstring(page.content)
    table, = tree.cssselect("table.tidetables")
    df, = pandas.read_html(etree.tostring(table), header=0, index_col=0)
    return df


def dict2list(d):
    n = max(map(int, d.keys())) + 1
    return [d[str(i)] for i in range(n)]


def month_tide_array(year, month):
    return [
        dict2list(row)
        for row in json.loads(get_tide_table(year, month).to_json(orient="records"))
    ]


def months_tide_array(year, months):
    return {m: month_tide_array(year, m) for m in months}


@app.cli.command(name="write-tide-table")
@click.option("--year", default=2008)
@click.option("--months", default="3-7")
@click.argument("output", default="./client/src/data/tide-table.json")
def write_tide_table(year, months, output):
    path = Path(output)
    path.parent.mkdir(parents=True, exist_ok=True)
    m0, m1 = map(int, months.split("-"))
    tides = months_tide_array(year, range(m0, m1 + 1))
    with path.open("w") as f:
        json.dump(tides, f)
