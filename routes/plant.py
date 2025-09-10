from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth import get_current_user
from config import get_db
from utils import load_image, predict_disease
from tables.predictions import Prediction
from pydantic import BaseModel
from typing import List
import os

router = APIRouter(prefix="/plant", tags=["Plant Disease Detection"])

model = None
class_names = []

# ---------- Response Schemas ----------
class PredictionResponse(BaseModel):
    user: str
    disease_prediction: str
    confidence: float
    prediction_id: int

class PredictionHistoryResponse(BaseModel):
    prediction_id: int
    filename: str
    disease_prediction: str
    confidence: float
    created_at: str
# -------------------------------------

@router.post("/predict")
async def predict_plant_disease(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    global model, class_names

    if model is None or not class_names:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded yet. Try again later."
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image."
        )

    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as f:
        f.write(await file.read())

    try:
        img_array = load_image(temp_file_path)
        predicted_class, confidence = predict_disease(model, img_array, class_names)

        # ✅ Positive, encouraging notes only
        note = None
        if confidence < 5:
            note = "Keep going! Try taking another image for the best results."
        elif confidence < 7:
            note = "Everything looks good! Keep monitoring your plant."
        elif confidence < 10:
            note = "Your plant is doing well! Continue nurturing it."
        else:
            note = "Excellent! The prediction is confident and positive."

        # Save prediction to database
        prediction = Prediction(
            user_id=current_user.id,
            filename=file.filename,
            predicted_class=predicted_class,
            confidence=float(confidence)
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

    finally:
        os.remove(temp_file_path)

    return {
        "user": current_user.email,
        "disease_prediction": predicted_class,
        "confidence": f"{confidence}%",
        "prediction_id": prediction.id,
        "note": note
    }

@router.get("/history", response_model=List[PredictionHistoryResponse])
async def get_prediction_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.id).all()

    return [
        {
            "prediction_id": p.id,
            "filename": p.filename,
            "disease_prediction": p.predicted_class,
            "confidence": p.confidence,
            "created_at": p.created_at.isoformat()
        }
        for p in predictions
    ]
