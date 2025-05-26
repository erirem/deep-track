import os
import cv2
from typing import List, Tuple


def crop_rois(
    image_path: str, detections: List[dict], resize_to: Tuple[int, int] = (256, 256)
):

    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Görüntü bulunamadı: {image_path}")

    filename = os.path.splitext(os.path.basename(image_path))[0]
    roi_list = []

    for idx, det in enumerate(detections):
        x1, y1, x2, y2 = det["bbox"]
        cls = det.get("class", det.get("class_id", -1))

        roi = image[y1:y2, x1:x2]
        resized = cv2.resize(roi, resize_to)

        crop_name = f"{filename}_bbox{idx}_class{cls}"
        info = {"crop_name": crop_name, "bbox": [x1, y1, x2, y2], "class": cls}

        roi_list.append((resized, info))

    return roi_list
