import joblib
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the custom RandomForest class
from custom_rf import RandomForest

def resave_model():
    """
    Load the existing model and re-save it with the correct module reference
    """
    try:
        # Load the problematic model
        # We need to temporarily fix the import issue
        import __main__
        __main__.RandomForest = RandomForest
        
        # Now load the model
        model = joblib.load('./model/random_forest_final_model.pkl')
        
        # Re-save it with the correct module reference
        joblib.dump(model, './model/random_forest_final_model_fixed.pkl')
        
        print("Model re-saved successfully!")
        print("Rename 'random_forest_final_model_fixed.pkl' to 'random_forest_final_model.pkl'")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    resave_model()