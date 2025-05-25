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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📁 Görseller klasörü
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

    # 🧠 Hibrit modelle tahmin
    result = process_image(selected_image_path)

    # 🧭 GPS + zaman bilgisi
    gps_lat = round(random.uniform(39.9, 40.1), 6)
    gps_lng = round(random.uniform(30.4, 30.6), 6)
    timestamp = datetime.datetime.now().isoformat()

    # 🖼 Görseli base64 olarak encode et
    _, buffer = cv2.imencode(".jpg", image)
    encoded_img = base64.b64encode(buffer).decode("utf-8")

    result["image"] = encoded_img
    result["filename"] = os.path.basename(selected_image_path)
    result["gps"] = {"lat": gps_lat, "lng": gps_lng}
    result["timestamp"] = timestamp

    return result
