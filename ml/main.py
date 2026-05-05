# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import tensorflow as tf
# import numpy as np
# import cv2
# import os
# from preprocessing.preprocess import preprocess_image

# app = FastAPI(title="Cattle Disease Detection API")

# # -----------------------------
# # Enable CORS
# # -----------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -----------------------------
# # Paths
# # -----------------------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(BASE_DIR, "models", "cow_disease_preproccesed_mobilenetv2.keras")

# # ⚠️ IMPORTANT: Match EXACT order from training
# CLASSES = ["Healthy", "Foot and Mouth Disease"]

# print(f"📦 Loading model from: {MODEL_PATH}")

# # -----------------------------
# # Load Model
# # -----------------------------
# def load_model(path):
#     if not os.path.exists(path):
#         raise FileNotFoundError(f"Model file not found at {path}")

#     model = tf.keras.models.load_model(path, compile=False)
#     print("✅ Model loaded successfully")
#     return model

# model = load_model(MODEL_PATH)

# # -----------------------------
# # Health Check
# # -----------------------------
# @app.get("/")
# def health_check():
#     return {"status": "running"}

# # -----------------------------
# # Prediction Endpoint
# # -----------------------------
# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):

#     if file.content_type not in ["image/jpeg", "image/png"]:
#         raise HTTPException(
#             status_code=400,
#             detail="Only JPG and PNG images are allowed."
#         )

#     try:
#         contents = await file.read()
#         npimg = np.frombuffer(contents, np.uint8)
#         img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

#         if img is None:
#             raise HTTPException(status_code=400, detail="Invalid image.")

#         # Preprocess image
#         img = preprocess_image(img)

#         # Predict
#         preds = model.predict(img)

#         print("Raw Prediction:", preds)

#         # If last layer already has softmax → do NOT apply again
#         if preds.shape[-1] == len(CLASSES):
#             probabilities = preds[0]
#         else:
#             probabilities = tf.nn.softmax(preds[0]).numpy()

#         idx = int(np.argmax(probabilities))
#         confidence = float(probabilities[idx])

#         return {
#             "prediction": CLASSES[idx],
#             "confidence": round(confidence, 4),
#             "all_probabilities": {
#                 CLASSES[i]: float(probabilities[i])
#                 for i in range(len(CLASSES))
#             }
#         }

#     except Exception as e:
#         print("❌ Prediction Error:", e)
#         raise HTTPException(status_code=500, detail="Prediction failed.")
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import tensorflow as tf
import numpy as np
import cv2
import os

from preprocessing.preprocess import preprocess_image

# -----------------------------
# Configuration
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def resolve_model_path():
    """
    Auto-pick a model file from ml/models.
    Priority:
    1) Exact expected default filename (for backwards compatibility)
    2) First .keras file found alphabetically
    """
    default_path = os.path.join(MODEL_DIR, "FMD_Preprocessed_Data_Augmentation.keras")
    if os.path.exists(default_path):
        return default_path

    if not os.path.isdir(MODEL_DIR):
        return default_path

    keras_files = sorted(
        [
            os.path.join(MODEL_DIR, name)
            for name in os.listdir(MODEL_DIR)
            if name.lower().endswith(".keras")
        ]
    )
    return keras_files[0] if keras_files else default_path


MODEL_PATH = resolve_model_path()

# ⚠️ IMPORTANT: Match EXACT alphabetical order from your training dataset folders
CLASSES = ["Healthy", "Foot and Mouth Disease"]

# Global dictionary to hold the loaded model
ml_models = {}
ml_models["mock_mode"] = False

# -----------------------------
# Lifespan Event (Best Practice for ML in FastAPI)
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup: Run this when the server starts
    print(f"[ML] Loading model from: {MODEL_PATH}")
    if not os.path.exists(MODEL_PATH):
        print(f"[ML] Model file missing at {MODEL_PATH}. Starting in mock mode.")
        ml_models["mock_mode"] = True
        yield
        ml_models.clear()
        print("[ML] Mock mode stopped.")
        return
    
    # Load model into the global dictionary
    ml_models["cow_disease_model"] = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("[ML] Model loaded successfully")
    
    yield # App is now running and accepting requests
    
    # Teardown: Run this when the server shuts down
    ml_models.clear()
    print("[ML] Model unloaded to free memory.")

# Initialize FastAPI with the lifespan context
app = FastAPI(title="Cattle Disease Detection API", lifespan=lifespan)

# -----------------------------
# Enable CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/")
def health_check():
    return {
        "status": "running",
        "model_loaded": "cow_disease_model" in ml_models,
        "mock_mode": ml_models.get("mock_mode", False)
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPG and PNG images are allowed.")

    try:
        if ml_models.get("mock_mode", False):
            return {
                "prediction": "Foot and Mouth Disease",
                "confidence": 0.91,
                "all_probabilities": {
                    "Healthy": 0.09,
                    "Foot and Mouth Disease": 0.91
                }
            }

        # Read image into memory
        contents = await file.read()
        npimg = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file or corrupted data.")

        # Preprocess the image (Raw pixels only!)
        processed_img = preprocess_image(img)

        # Retrieve the loaded model
        model = ml_models["cow_disease_model"]

        # Predict
        preds = model.predict(processed_img, verbose=0)
        
        # Since your model was trained with a Softmax output layer, 
        # preds[0] already contains the probabilities.
        probabilities = preds[0]
        
        # Get the highest confidence class
        idx = int(np.argmax(probabilities))
        confidence = float(probabilities[idx])

        return {
            "prediction": CLASSES[idx],
            "confidence": round(confidence, 4),
            "all_probabilities": {
                CLASSES[i]: round(float(probabilities[i]), 4) for i in range(len(CLASSES))
            }
        }

    except Exception as e:
        print(f"[ML] Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")