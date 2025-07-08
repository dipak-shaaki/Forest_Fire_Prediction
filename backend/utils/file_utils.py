import os

def list_csv_files(path):
    return [f for f in os.listdir(path) if f.endswith('.csv')]
