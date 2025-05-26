from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64, cv2, os, random, glob, datetime

from api.core.detection_pipeline import process_image
from api.core.hats import HAT_CONFIG

from itertools import cycle

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gps_iterators = {line_id: cycle(stations) for line_id, stations in HAT_CONFIG.items()}

TEST_IMAGE_FOLDER = os.path.join(os.path.dirname(__file__), "..", "test_images")


@app.get("/predict-live")
def predict_live(lineId: str = Query("ankara-istanbul")):
    if lineId not in gps_iterators:
        return JSONResponse(status_code=400, content={"error": "Unknown lineId"})

    image_files = glob.glob(os.path.join(TEST_IMAGE_FOLDER, "*.jpg"))
    if not image_files:
        return JSONResponse(status_code=404, content={"error": "No images found"})

    selected_image_path = random.choice(image_files)
    image = cv2.imread(selected_image_path)
    if image is None:
        return JSONResponse(status_code=500, content={"error": "Image read error"})

    result = process_image(selected_image_path)

    station_name, gps_lat, gps_lng = next(gps_iterators[lineId])
    timestamp = datetime.datetime.now().isoformat()

    _, buffer = cv2.imencode(".jpg", image)
    encoded_img = base64.b64encode(buffer).decode("utf-8")

    result["image"] = encoded_img
    result["filename"] = os.path.basename(selected_image_path)
    result["gps"] = {"lat": gps_lat, "lng": gps_lng, "station": station_name}
    result["timestamp"] = timestamp
    result["lineId"] = lineId

    return result
