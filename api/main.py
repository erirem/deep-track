from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pipeline_runner import process_image
from utils import get_random_image_path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/predict-live")
def predict_random_demo_image():
    image_path = get_random_image_path("test_images")
    if not image_path:
        return JSONResponse(content={"error": "No demo image found"}, status_code=404)

    result = process_image(image_path)
    return result
