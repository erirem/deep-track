# yolo_detector.py
from ultralytics import YOLO
import torch

def detect_with_yolo(image_path: str, model_path: str = "models/yolov8_best.pt", conf_threshold: float = 0.25):
    """
    YOLOv8 ile bir görüntüdeki nesneleri tespit eder.

    Args:
        image_path (str): Tespit yapılacak görselin yolu
        model_path (str): Eğitilmiş YOLOv8 modelinin yolu (.pt)
        conf_threshold (float): Minimum güven skoru (varsayılan: 0.25)

    Returns:
        List[dict]: Her biri {'bbox': [x1, y1, x2, y2], 'conf': score, 'class': int} formatında
    """
    model = YOLO(model_path)
    results = model(image_path, conf=conf_threshold)[0]

    detections = []
    for box in results.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = box.conf[0].item()
        cls = int(box.cls[0].item())
        detections.append({
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "conf": conf,
            "class": cls
        })

    return detections
