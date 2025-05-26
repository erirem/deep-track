from ultralytics import YOLO

def detect_with_yolo(image_path: str, model_path: str = "models/yolov8_best.pt", conf_threshold: float = 0.25):

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
