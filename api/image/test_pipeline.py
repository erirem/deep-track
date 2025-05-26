from api.core.detection_pipeline import process_image

if __name__ == "__main__":
    test_image = "test_images/img_1693.jpg"
    result = process_image(test_image)

    print("🔍 Test Sonucu:")
    print(result)
