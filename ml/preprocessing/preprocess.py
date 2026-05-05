import cv2
import numpy as np

IMG_SIZE = 224

# ImageNet mean and std (use if your backbone was pretrained on ImageNet)
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def normalize(img_float: np.ndarray) -> np.ndarray:
    """
    Normalize a float32 image array (already in 0-1 range).
    Uses ImageNet mean/std — matches most pretrained backbones (ResNet, EfficientNet, etc.)
    If your model was trained with /255 only (no standardization), comment out the last line.
    """
    img_float = img_float / 255.0                          # Scale to [0.0, 1.0]
    img_float = (img_float - IMAGENET_MEAN) / IMAGENET_STD # Standardize
    return img_float


def preprocess_image(img: np.ndarray) -> np.ndarray:
    """
    For the FULL IMAGE model (Global).
    Resizes the image to 224x224 and applies normalization.
    """
    img_rgb     = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
    img_float   = normalize(img_resized.astype(np.float32))
    img_batch   = np.expand_dims(img_float, axis=0)         # Shape: (1, 224, 224, 3)

    # Diagnostic — remove after confirming correctness
    print(f"[preprocess_image] range: {img_batch.min():.3f} – {img_batch.max():.3f} | "
          f"mean: {img_batch.mean():.3f}")

    return img_batch


def extract_patches(img: np.ndarray, step_size: int = 224) -> np.ndarray:
    """
    For the CROPPED model (Local).
    Slices the original image into a batch of 224x224 patches with normalization.

    Args:
        img:       BGR image (as returned by cv2.imread).
        step_size: Stride for the sliding window.
                   224 = no overlap (faster).
                   112 = 50% overlap (more accurate, slower).

    Returns:
        np.ndarray of shape (N, 224, 224, 3), dtype float32, normalized.
    """
    img_rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w, _  = img_rgb.shape
    patches  = []

    for y in range(0, max(1, h - IMG_SIZE + 1), step_size):
        for x in range(0, max(1, w - IMG_SIZE + 1), step_size):
            patch = img_rgb[y : y + IMG_SIZE, x : x + IMG_SIZE]

            # Pad edge remnants instead of silently dropping them
            if patch.shape[0] < IMG_SIZE or patch.shape[1] < IMG_SIZE:
                patch = cv2.copyMakeBorder(
                    patch,
                    0, IMG_SIZE - patch.shape[0],   # bottom pad
                    0, IMG_SIZE - patch.shape[1],   # right pad
                    cv2.BORDER_REFLECT
                )

            patches.append(normalize(patch.astype(np.float32)))

    # Fallback: image smaller than 224x224 — resize and normalize
    if len(patches) == 0:
        resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
        patches.append(normalize(resized.astype(np.float32)))

    batch = np.array(patches)  # Shape: (N, 224, 224, 3)

    # Diagnostic — remove after confirming correctness
    print(f"[extract_patches]  patches: {batch.shape[0]} | "
          f"range: {batch.min():.3f} – {batch.max():.3f} | "
          f"mean: {batch.mean():.3f}")

    return batch


def aggregate_patch_scores(patch_scores: np.ndarray, top_k: int = 3) -> float:
    """
    Aggregate per-patch prediction scores into a single image-level score.
    Uses mean of top-k patches to reduce noise from uninformative patches.

    Args:
        patch_scores: 1-D array of per-patch confidence scores (e.g., P(FMD)).
        top_k:        Number of highest-scoring patches to average.

    Returns:
        Scalar float — final aggregated score.
    """
    top_k    = min(top_k, len(patch_scores))
    top_vals = np.sort(patch_scores)[::-1][:top_k]
    return float(np.mean(top_vals))
