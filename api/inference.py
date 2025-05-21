from PIL import Image
import torch
from ultralytics import YOLO

yolo_model = YOLO("models/yolov8n.pt")


def run_yolo_and_maskrcnn(image_path):
    # 1. YOLO tahmini
    yolo_results = yolo_model(image_path)[0]
    boxes = yolo_results.boxes.xyxy.cpu().numpy()

    # 2. ROI'ları crop'la
    image = Image.open(image_path).convert("RGB")
    results = []

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        roi = image.crop((x1, y1, x2, y2))

        # 3. Mask R-CNN ile tahmin (placeholder kod)
        # prediction = mask_rcnn_predict(roi)
        # Örnek dummy:
        prediction = {
            "defect": "rail_crack",
            "confidence": 0.92,
            "severity": 3
        }

        results.append({
            "box": [x1, y1, x2, y2],
            "prediction": prediction
        })

    return results
