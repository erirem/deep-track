# run_pipeline_v2.py

from yolo_detector import detect_with_yolo
from roi_cropper import crop_rois
from mask_rcnn_segmenter import load_mask_rcnn_predictor, segment_with_mask_rcnn
from mask_merger import merge_masks_to_original
from visualize import save_results, show_image
import cv2

# 🔧 Ayarlar
image_path = "hybrid_pipeline/data/input/test.jpg"
yolo_model_path = "hybrid_pipeline/models/yolov8_best.pt"
mask_rcnn_config_path = "COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"
mask_rcnn_weights_path = "hybrid_pipeline/models/model_final.pth"
output_path = "hybrid_pipeline/data/output/test_segmented.jpg"

MASK_RCNN_CLASSES = [1, 3, 4]  # rail crack, squat, surface defect
CONFIDENCE_THRESHOLD = 0.8

print("🔍 YOLOv8 ile nesne tespiti yapılıyor...")
detections = detect_with_yolo(image_path, model_path=yolo_model_path)

if not detections:
    print("⚠️ Hiç tespit yok.")
    exit()

print(f"📦 {len(detections)} adet tespit bulundu.")

# Tespit edilen alanları ayır: yüksek güvenli ve düşük güvenli
high_conf_detections = []
low_conf_rois = []
low_conf_info = []

for det in detections:
    if det["conf"] >= CONFIDENCE_THRESHOLD:
        high_conf_detections.append(det)
    elif det["class"] in MASK_RCNN_CLASSES:
        low_conf_info.append(det)

# Crop işlemi sadece düşük güvenli bbox'lar için
print("✂️ Düşük güvenli bbox'lar crop’lanıyor...")
low_conf_rois = crop_rois(image_path, low_conf_info)

# Mask R-CNN segmentasyonu sadece düşük güvenli olanlar için
print("🧠 Mask R-CNN modeli yükleniyor...")
predictor = load_mask_rcnn_predictor(
    config_path=mask_rcnn_config_path,
    weights_path=mask_rcnn_weights_path,
    score_thresh=0.5
)

print("🖌 Düşük güvenli ROI’lar üzerinde segmentasyon yapılıyor...")
segmentation_results = segment_with_mask_rcnn(predictor, low_conf_rois)

# Mask'leri orijinal görsele yerleştir
print("🧹 Maskeler orijinal görsele uygulanıyor...")
final_image = merge_masks_to_original(
    image_path,
    high_conf_detections + low_conf_info,
    [None] * len(high_conf_detections) + segmentation_results
)

# Kaydet ve göster
print("📂 Sonuç kaydediliyor ve gösteriliyor...")
save_results(final_image, output_path)
show_image("Segmented Output", final_image)
