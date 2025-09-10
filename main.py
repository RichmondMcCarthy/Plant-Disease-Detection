from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users as user_routes
from routes import plant as plant_routes
from config import Base, engine
import os, json
import tensorflow as tf

app = FastAPI(
    debug=True,
    title="Plant Disease Detection API",
    description="API for user authentication and plant disease detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(user_routes.router)
app.include_router(plant_routes.router)

# Create tables + load model on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

    # Base directory (always points to where main.py lives)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_DIR = os.path.join(BASE_DIR, "trained_models")

    # Find a model file (.h5 or .keras)
    MODEL_PATH = None
    for filename in ["trained_model.h5", "trained_model.keras"]:
        candidate = os.path.join(MODEL_DIR, filename)
        if os.path.exists(candidate):
            MODEL_PATH = candidate
            break

    if not MODEL_PATH:
        raise FileNotFoundError("No trained model found in 'trained_models/'")

    print("Loading model from:", MODEL_PATH)
    plant_routes.model = tf.keras.models.load_model(MODEL_PATH)

    # Load class names
    CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, "r") as f:
            plant_routes.class_names = json.load(f)
        print(f"Loaded {len(plant_routes.class_names)} class names from JSON.")
        print("First 5 classes:", plant_routes.class_names[:5])
    else:
        # fallback: define manually if json is missing
        plant_routes.class_names = [
            'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
            'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 
            'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
            'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
            'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
            'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
            'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
            'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy',
            'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
            'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
            'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
            'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
            'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
        ]
        print(f"Loaded default {len(plant_routes.class_names)} class names (fallback).")


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Plant Disease Detection API!"}
