# server/analysis/ranking_plot.py
import json, os, numpy as np
import pandas as pd
import matplotlib.pyplot as plt

plt.switch_backend("Agg")
DATA_FILE = "../data/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def load_results(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rows = []
    for r in data.get("results", []):
        model = r.get("model_name", "Unknown")
        scores = r.get("cv_scores", [])
        if scores:
            rows.append({"Model": model, "Accuracy": np.mean(scores)})
    return pd.DataFrame(rows)

def main():
    df = load_results(DATA_FILE).sort_values("Accuracy", ascending=False)
    ranks = np.arange(1, len(df)+1)
    fig, ax = plt.subplots(figsize=(12,6))
    
    ax.scatter(ranks, df["Accuracy"], s=250, color="#0077b6", edgecolors="black", zorder=3)
    
    for i, model in enumerate(df["Model"]):
        ax.text(ranks[i], df["Accuracy"].iloc[i]+0.01, model, ha='center', va='bottom', fontsize=10, rotation=30)
    
    ax.set_xticks(ranks)
    ax.set_xticklabels([f"{int(r)}°" for r in ranks])
    ax.set_xlabel("Ranking (1 = melhor)")
    ax.set_ylabel("Acurácia Média")
    ax.set_title("Ranking de Modelos (Média das CV Scores)", fontsize=16)
    ax.grid(True, linestyle="--", alpha=0.4, zorder=0)
    
    plt.ylim(0,1)
    plt.tight_layout()
    save_path = os.path.join(FIGURES_PATH, "ranking_plot.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ Ranking salvo em: {save_path}")
