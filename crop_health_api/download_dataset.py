import kagglehub
import os
import shutil

def main():
    print("📦 Downloading PlantVillage dataset from Kaggle...")
    # This uses the snippet you provided
    path = kagglehub.dataset_download("abdallahalidev/plantvillage-dataset")
    
    print(f"\n✅ Dataset downloaded to: {path}")
    print("\nNext steps to use this dataset with the AI API:")
    print("1. This dataset contains thousands of raw images for training.")
    print("2. To use the 'AI' features properly (not just heuristics), you need a trained model.")
    print("3. If you have a trained SavedModel, place it in the 'plantvillage_model' folder.")
    print("4. The current API will use 'Heuristic Mode' until a real model is found at MODEL_PATH.")

if __name__ == "__main__":
    main()
