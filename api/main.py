from fastapi import FastAPI
from inference import run_yolo_and_maskrcnn
from utils import get_random_image_path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict-live")
def predict_live():
    image_path = get_random_image_path()
    results = run_yolo_and_maskrcnn(image_path)
    return {
        "image_path": image_path,
        "results": results
    }
