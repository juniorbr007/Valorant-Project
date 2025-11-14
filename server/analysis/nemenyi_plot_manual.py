# server/analysis/nemenyi_plot_manual.py

import json
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from itertools import combinations

plt.switch_backend("Agg")  # para rodar sem display gráfico

# Caminhos base
DATA_FILE = "../data/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

# Tabela de valores q_alpha para Nemenyi 0.05 (aproximado)
# Para k = 2..10 modelos
Q_ALPHA_05 = {2: 1.960, 3: 2.343, 4: 2.569, 5: 2.728,
              6: 2.850, 7: 2.949, 8: 3.031, 9: 3.102, 10: 3.164}

def load_results(file_path):
    """
    Lê ml_results.json e retorna um DataFrame com colunas:
    Dataset, Model, Accuracy
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Erro: {file_path} não encontrado.")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    results_list = []
    for r in data.get("results", []):
        dataset = r.get("dataset", "Unknown Dataset")
        model = r.get("model_name", "Unknown Model")
        cv_scores = r.get("cv_scores", [])
        for score in cv_scores:
            results_list.append({"Dataset": dataset, "Model": model, "Accuracy": score})

    df = pd.DataFrame(results_list)
    return df

def compute_mean_ranks(df):
    """
    Calcula ranks médios por modelo em cada dataset/fold
    """
    pivot = df.pivot_table(index=df.groupby('Dataset').cumcount(), 
                           columns='Model', values='Accuracy')
    pivot = pivot.fillna(pivot.mean())  # preencher NaN se faltar algum fold
    ranks = pivot.rank(axis=1, method='average', ascending=False)
    mean_ranks = ranks.mean().sort_values(ascending=False)
    return mean_ranks

def compute_cd(k, N, alpha=0.05):
    """
    Calcula Critical Difference (CD) para Nemenyi manualmente
    """
    q_alpha = Q_ALPHA_05.get(k)
    if q_alpha is None:
        # aproximar para k > 10
        q_alpha = 3.164
    cd = q_alpha * np.sqrt(k*(k+1)/(6*N))
    return cd

def generate_nemenyi_plot(df, save_path):
    mean_ranks = compute_mean_ranks(df)
    models = mean_ranks.index.tolist()
    ranks = mean_ranks.values
    k = len(models)
    N = df['Dataset'].nunique()  # número de datasets/folds
    cd = compute_cd(k, N)

    # Plot
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.hlines(1, ranks.min() - 1, ranks.max() + 1, color='white')  # linha base invisível

    # Plot dos modelos
    for i, (model, rank) in enumerate(zip(models, ranks)):
        ax.plot(rank, 1, 'o', markersize=12, color="#005f73", mec="black", mew=1.2)
        ax.text(rank, 1.05, model, rotation=45, ha="center", va="bottom", fontsize=10)

    # Linha do Critical Difference
    ax.hlines(0.9, ranks.min(), ranks.min() + cd, color="red", linewidth=3)
    ax.text(ranks.min() + cd/2, 0.85, f"CD = {cd:.2f}", color="red",
            ha="center", va="top", fontsize=10)

    # Conexões de não-significância
    for m1, m2 in combinations(range(k), 2):
        if abs(ranks[m1] - ranks[m2]) <= cd:
            x1, x2 = ranks[m1], ranks[m2]
            ax.plot([x1, x2], [0.95, 0.95], color="gray", lw=2)

    ax.set_ylim(0.8, 1.2)
    ax.set_xlim(ranks.min() - 0.5, ranks.max() + 0.5)
    ax.axis('off')
    plt.title("Nemenyi Plot (Critical Difference) - Comparação de Modelos", fontsize=14)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ Nemenyi plot salvo em: {save_path}")

def main():
    df = load_results(DATA_FILE)
    save_path = os.path.join(FIGURES_PATH, "nemenyi_plot_manual.png")
    generate_nemenyi_plot(df, save_path)

if __name__ == "__main__":
    main()
