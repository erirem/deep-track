import cv2
import os
from api.detection.yolo_detector import detect_with_yolo
from api.image.roi_cropper import crop_rois
from api.detection.mask_rcnn_segmenter import load_mask_rcnn_predictor, segment_with_mask_rcnn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
yolo_model_path = os.path.join(BASE_DIR, "models", "yolov8_best.pt")
mask_rcnn_config_path = "COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"
mask_rcnn_weights_path = os.path.join(BASE_DIR, "models", "model_final.pth")

CONFIDENCE_THRESHOLD = 0.8

predictor = load_mask_rcnn_predictor(
    config_path=mask_rcnn_config_path,
    weights_path=mask_rcnn_weights_path,
    score_thresh=0.5
)

def process_image(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Invalid image"}

    h, w = image.shape[:2]
    detections = detect_with_yolo(image_path, model_path=yolo_model_path)
    if not detections:
        return {"result": [], "message": "No detections"}

    results = []
    for idx, det in enumerate(detections):
        cls, conf = det["class"], det["conf"]
        x1, y1, x2, y2 = det["bbox"]
        source = "YOLO"

        if conf < CONFIDENCE_THRESHOLD:
            roi, _ = crop_rois(image_path, [det])[0]
            crop_name = f"demo_bbox{idx}_class{cls}"
            result = segment_with_mask_rcnn(predictor, [(roi, {"class": cls, "crop_name": crop_name})])[0]
            mask_found = result is not None and "mask" in result
            source = "MaskRCNN" if mask_found else "YOLO"

        results.append({
            "class_id": cls,
            "confidence": round(conf, 3),
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "source": source
        })

    return {
        "filename": os.path.basename(image_path),
        "result": results
    }
