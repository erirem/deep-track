# mask_rcnn_segmenter.py
import torch
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2 import model_zoo
import cv2
import numpy as np
from typing import List, Tuple
import os
def load_mask_rcnn_predictor(config_path: str, weights_path: str, score_thresh: float = 0.5):
    from detectron2.config import get_cfg
    from detectron2 import model_zoo

    cfg = get_cfg()
    cfg.merge_from_file(model_zoo.get_config_file(config_path))
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = score_thresh
    cfg.MODEL.WEIGHTS = weights_path
    cfg.MODEL.DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 3  # <<<<< burada doğru sınıf sayısı

    return DefaultPredictor(cfg)

def segment_with_mask_rcnn(predictor, roi_images: List[Tuple[np.ndarray, dict]]):
    """
    ROI görüntülerinde segmentasyon yapar ve pred mask'leri PNG olarak kaydeder.
    """
    results = []

    for idx, (roi_img, info) in enumerate(roi_images):
        outputs = predictor(roi_img)

        instances = outputs["instances"].to("cpu")
        print(f"\n🔍 ROI {idx}: {info.get('crop_name', 'unknown_crop')}")
        print(f"📦 tespit edilen instance sayısı: {len(instances)}")

        if len(instances) == 0:
            print("⚠️ Segmentasyon yapılmadı.")
            results.append(None)
            continue

        masks = instances.pred_masks.numpy()
        classes = instances.pred_classes.numpy()
        scores = instances.scores.numpy()

        best_idx = scores.argmax()
        best_mask = masks[best_idx]
        best_class = int(classes[best_idx])
        best_score = float(scores[best_idx])
        mask_sum = best_mask.sum()

        print(f"✅ En iyi mask sınıfı: {best_class} | skor: {best_score:.2f} | mask pixel toplamı: {mask_sum}")

        # ✅ Predict mask'i PNG olarak kaydet
        pred_mask_save_dir = "../data/test_final/masks"
        os.makedirs(pred_mask_save_dir, exist_ok=True)
        pred_mask_path = os.path.join(pred_mask_save_dir, f"{info['crop_name']}_pred.png")
        cv2.imwrite(pred_mask_path, (best_mask.astype("uint8") * 255))

        # (opsiyonel) Debug görselleri
        os.makedirs("../debug_masks", exist_ok=True)
        cv2.imwrite(f"debug_masks/roi_{idx}.jpg", roi_img)
        cv2.imwrite(f"debug_masks/roi_{idx}_mask.jpg", best_mask.astype("uint8") * 255)

        results.append({
            "mask": best_mask,
            "class": best_class,
            "score": best_score
        })

    return results
