from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import cv2
import os
import random
import glob
import datetime

from pipeline_runner import process_image
from itertools import cycle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAIL_LINE = [
    (39.9208, 32.8541),  # Ankara
    (39.93, 32.75),
    (40.0, 32.4),
    (40.1, 32.0),
    (40.3, 31.5),
    (40.6, 30.5),
    (40.8, 29.8),
    (41.0, 29.2),
    (41.0082, 28.9784)  # İstanbul
]
gps_cycle = cycle(RAIL_LINE)

TEST_IMAGE_FOLDER = os.path.join(os.path.dirname(__file__), "..", "test_images")

@app.get("/predict-live")
def predict_live():
    image_files = glob.glob(os.path.join(TEST_IMAGE_FOLDER, "*.jpg"))
    if not image_files:
        return JSONResponse(status_code=404, content={"error": "No images found"})

    selected_image_path = random.choice(image_files)
    image = cv2.imread(selected_image_path)
    if image is None:
        return JSONResponse(status_code=500, content={"error": "Image read error"})

    result = process_image(selected_image_path)

    gps_lat, gps_lng = next(gps_cycle)
    timestamp = datetime.datetime.now().isoformat()

    _, buffer = cv2.imencode(".jpg", image)
    encoded_img = base64.b64encode(buffer).decode("utf-8")

    result["image"] = encoded_img
    result["filename"] = os.path.basename(selected_image_path)
    result["gps"] = {"lat": gps_lat, "lng": gps_lng}
    result["timestamp"] = timestamp

    return result

