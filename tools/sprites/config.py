"""One JSON file per character in chars/, so that each can be edited alone."""
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def load_config() -> dict:
    out = {}
    for path in sorted(glob.glob(os.path.join(HERE, "chars", "*.json"))):
        out[os.path.splitext(os.path.basename(path))[0]] = json.load(open(path))
    return out
