import os
import pandas as pd

# Base directory of the backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "nepal_fire_data_cleaned.csv")

def load_fire_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"🔥 File not found at: {DATA_PATH}")
    return pd.read_csv(DATA_PATH)

def get_yearly_fire_counts():
    df = load_fire_data()
    
    # Convert 'acq_date' to datetime
    df['acq_date'] = pd.to_datetime(df['acq_date'], errors='coerce')

    # Extract year
    df['year'] = df['acq_date'].dt.year

    # Group and count by year
    yearly_counts = df.groupby('year').size().reset_index(name='count')

    return yearly_counts.to_dict(orient='records')

def get_monthly_fire_counts():
    df = load_fire_data()
    df['acq_date'] = pd.to_datetime(df['acq_date'], errors='coerce')
    df['month'] = df['acq_date'].dt.month
    return df.groupby('month').size().reset_index(name='count').to_dict(orient='records')

def get_confidence_level_counts():
    df = load_fire_data()

    if 'confidence' not in df.columns:
        return {"error": "Confidence data not found."}

    # Normalize column (if it's numeric, you can bin it instead)
    return df['confidence'].value_counts().reset_index(name='count') \
             .rename(columns={'index': 'confidence'}) \
             .to_dict(orient='records')


def get_elevation_fire_counts():
    df = load_fire_data()

    bins = [0, 500, 1000, 2000, 3000, 4000, 9000]
    labels = ["0-500m", "500-1000m", "1000-2000m", "2000-3000m", "3000-4000m", "4000m+"]

    df['elevation_bin'] = pd.cut(df['elevation'], bins=bins, labels=labels, include_lowest=True)
    result = df.groupby('elevation_bin').size().reset_index(name='count')

    return result.to_dict(orient='records')
