# tasks.py
import os
from background_task import background

@background(schedule=600) 
def delete_zip(zip_path):
    os.remove(zip_path)