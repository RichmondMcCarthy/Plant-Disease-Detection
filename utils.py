# utils.py
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image

def load_image(file_path, target_size=(128, 128)):
    """
    Load an image from file, resize it, and normalize it for prediction.

    Args:
        file_path (str): Path to the image file.
        target_size (tuple): Target size for the image (width, height).

    Returns:
        np.ndarray: Preprocessed image ready for prediction.
    """
    img = keras_image.load_img(file_path, target_size=target_size)
    img_array = keras_image.img_to_array(img)
    img_array = img_array / 255.0  # Normalize to [0,1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

def predict_disease(model, img_array, class_names):
    """
    Predict plant disease class for a given preprocessed image.

    Args:
        model (tf.keras.Model): Loaded Keras model.
        img_array (np.ndarray): Preprocessed image array.
        class_names (list): List of class names.

    Returns:
        tuple: (predicted_class_name (str), confidence (float))
    """
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    predicted_class = class_names[predicted_index]
    confidence = round(100 * np.max(predictions[0]), 2)
    return predicted_class, confidence
