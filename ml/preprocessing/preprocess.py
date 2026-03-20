import cv2
import numpy as np

IMG_SIZE = 224

def preprocess_image(img):
    """For the FULL IMAGE model (Global)"""
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
    img_float = img_resized.astype(np.float32)
    img_batch = np.expand_dims(img_float, axis=0)
    return img_batch

def extract_patches(img, step_size=224):
    """
    For the CROPPED model (Local). 
    Slices the original image into a batch of 224x224 squares.
    Note: step_size=224 means no overlap (faster API). 
    Change to 112 for 50% overlap (more accurate, slower API).
    """
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _ = img_rgb.shape
    patches = []

    # Sliding window extraction
    for y in range(0, max(1, h - IMG_SIZE + 1), step_size):
        for x in range(0, max(1, w - IMG_SIZE + 1), step_size):
            patch = img_rgb[y:y+IMG_SIZE, x:x+IMG_SIZE]
            
            # Ensure the patch is exactly 224x224 (drops edge remnants)
            if patch.shape[0] == IMG_SIZE and patch.shape[1] == IMG_SIZE:
                patches.append(patch.astype(np.float32))

    # Fallback: If the uploaded image was smaller than 224x224, just resize it
    if len(patches) == 0:
        resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float32)
        patches.append(resized)

    # Return as a single batch, e.g., Shape: (15, 224, 224, 3)
    return np.array(patches)