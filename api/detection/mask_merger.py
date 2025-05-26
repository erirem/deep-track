import numpy as np
import cv2
from typing import List

CLASS_NAMES = {
    0: "head_check",
    1: "rail_crack",
    2: "fastening_defect",
    3: "squat",
    4: "surface_defect",
    5: "healthy_sleeper",
    6: "healthy_fastening",
    7: "sleeper_crack",
    8: "healthy_rail"
}

def merge_masks_to_original(image_path: str,
                             detections: List[dict],
                             segmentation_results: List[dict]) -> np.ndarray:
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Görüntü bulunamadı: {image_path}")

    overlay = image.copy()

    for det, seg in zip(detections, segmentation_results):
        x1, y1, x2, y2 = det["bbox"]
        class_id = det.get("class_id", det.get("class"))
        conf = det.get("confidence", det.get("conf"))
        label = f"{CLASS_NAMES.get(class_id, 'cls')} ({conf:.2f})"
        color = (0, 255, 0)  # yeşil

        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)
        cv2.putText(overlay, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        if seg is not None and "mask" in seg:
            mask = seg["mask"]
            resized_mask = cv2.resize(mask.astype('uint8'), (x2 - x1, y2 - y1))
            full_mask = np.zeros(image.shape[:2], dtype='uint8')
            full_mask[y1:y2, x1:x2] = resized_mask

            colored_mask = np.zeros_like(image)
            for i in range(3):
                colored_mask[:, :, i] = full_mask * color[i]

            overlay = cv2.addWeighted(overlay, 1.0, colored_mask, 0.4, 0)

    return overlay
