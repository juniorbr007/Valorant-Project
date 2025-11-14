# server/analysis/cv_boxplot.py
import json, os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

plt.switch_backend("Agg")

DATA_FILE = "../data/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def load_results(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} não encontrado.")

    rows = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for r in data.get("results", []):
        model = r.get("model_name", "Unknown")
        dataset = r.get("dataset", "Unknown")
        for score in r.get("cv_scores", []):
            rows.append({"Model": model, "Dataset": dataset, "Accuracy": score})
    return pd.DataFrame(rows)

def main():
    df = load_results(DATA_FILE)
    plt.figure(figsize=(12,6))
    sns.set_style("whitegrid")
    palette = sns.color_palette("Set2", n_colors=df["Model"].nunique())
    
    sns.boxplot(x="Model", y="Accuracy", hue="Dataset", data=df, palette=palette, width=0.6)
    sns.stripplot(x="Model", y="Accuracy", hue="Dataset", data=df, 
                  dodge=True, color='black', alpha=0.5, size=4)
    
    plt.title("Distribuição das Acurácias por Modelo e Dataset", fontsize=16)
    plt.ylabel("Acurácia")
    plt.xlabel("Modelo")
    plt.ylim(0,1)
    
    handles, labels = plt.gca().get_legend_handles_labels()
    plt.legend(handles[0:len(df['Dataset'].unique())], labels[0:len(df['Dataset'].unique())], title="Dataset")
    
    plt.xticks(rotation=30)
    plt.tight_layout()
    save_path = os.path.join(FIGURES_PATH, "cv_boxplot.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ CV Boxplot salvo em: {save_path}")
