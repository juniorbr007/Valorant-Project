import json, os, numpy as np, sys
import pandas as pd
import matplotlib.pyplot as plt

plt.switch_backend("Agg")

# --- CAMINHO CORRIGIDO ---
DATA_FILE = "results/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def load_results(file_path):
    """
    Carrega os resultados e calcula a acurácia média para cada 
    entrada "model_name" completa.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} não encontrado.")
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rows = []
    for r in data.get("results", []):
        model = r.get("model_name", "Unknown")
        scores = r.get("cv_scores", [])
        if scores:
            # A lógica aqui está correta: queremos a média da acurácia
            # para o nome completo (ex: "Cypher's Edge - RF")
            rows.append({"Model": model, "Accuracy": np.mean(scores)})
    return pd.DataFrame(rows)

def main():
    try:
        df = load_results(DATA_FILE).sort_values("Accuracy", ascending=False)
    except FileNotFoundError as e:
        print(f"❌ ERRO: {e}", file=sys.stderr)
        return
    except Exception as e:
        print(f"❌ Erro inesperado ao carregar dados: {e}", file=sys.stderr)
        return

    if df.empty:
        print("DataFrame vazio após carregar os dados. Verifique o JSON.")
        return
        
    ranks = np.arange(1, len(df)+1)
    fig, ax = plt.subplots(figsize=(12, 7)) # Aumentei altura
    
    colors = ['#0077b6' if "Cypher's Edge" in m else '#00b4d8' for m in df["Model"]]
    
    ax.scatter(ranks, df["Accuracy"], s=250, color=colors, edgecolors="black", zorder=3)
    
    for i, model in enumerate(df["Model"]):
        # Ajusta a rotação e alinhamento do texto
        ax.text(ranks[i], df["Accuracy"].iloc[i]+0.015, model, ha='center', va='bottom', fontsize=9, rotation=45)
    
    ax.set_xticks(ranks)
    ax.set_xticklabels([f"{int(r)}°" for r in ranks])
    ax.set_xlabel("Ranking (1° = melhor)", fontsize=12)
    ax.set_ylabel("Acurácia Média (10-Fold CV)", fontsize=12)
    ax.set_title("Ranking de Desempenho (Sistema + Classificador)", fontsize=16)
    ax.grid(True, linestyle="--", alpha=0.4, zorder=0)
    
    plt.ylim(0, 1.05)
    plt.tight_layout()
    save_path = os.path.join(FIGURES_PATH, "ranking_plot.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ Ranking salvo em: {save_path}")

if __name__ == "__main__":
    main()