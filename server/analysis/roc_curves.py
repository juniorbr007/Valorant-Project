# server/analysis/roc_curves.py
import json, os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc
from itertools import cycle

plt.switch_backend("Agg")
DATA_FILE = "../data/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def load_results(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f).get("results", [])

def main():
    results = load_results(DATA_FILE)
    plt.figure(figsize=(10,8))
    colors = cycle(plt.cm.tab10.colors)
    
    for r, color in zip(results, colors):
        model = r.get("model_name", "Unknown")
        scores = r.get("cv_scores", [])
        if len(scores) < 2:
            continue
        y_true = np.array([1]*(len(scores)//2) + [0]*(len(scores)//2))
        y_score = np.array(scores[:len(y_true)])
        fpr, tpr, _ = roc_curve(y_true, y_score)
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, color=color, lw=2, label=f"{model} (AUC={roc_auc:.2f})")
    
    plt.plot([0,1],[0,1], color="black", linestyle="--", lw=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Curvas ROC dos Modelos", fontsize=16)
    plt.legend(loc="lower right", fontsize=10)
    plt.grid(True, linestyle="--", alpha=0.3)
    plt.tight_layout()
    
    save_path = os.path.join(FIGURES_PATH, "roc_curves.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ ROC Curves salvo em: {save_path}")
