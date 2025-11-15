import json, os, sys
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

plt.switch_backend("Agg")

# --- 1. CAMINHO CORRIGIDO ---
DATA_FILE = "results/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def load_results(file_path):
    """
    Carrega os resultados e extrai o nome, sistema e 
    a matriz de confusão de cada modelo.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} não encontrado.")
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f).get("results", [])
    
    rows = []
    for r in data:
        full_model_name = r.get("model_name", "Unknown - Unknown")
        cm = r.get("confusion_matrix")
        
        if not cm or len(cm) != 2 or len(cm[0]) != 2 or len(cm[1]) != 2:
            print(f"Aviso: Matriz de confusão inválida para {full_model_name}. Pulando.")
            continue
            
        # Extrai Sistema e Classificador
        parts = full_model_name.split(" - ")
        if len(parts) == 2:
            dataset_name = parts[0].strip() # "Cypher's Edge" ou "Literatura 1"
            model_name = parts[1].strip()   # "Random Forest", "MLP", etc.
        else:
            dataset_name = "Unknown"
            model_name = full_model_name

        # CM: [[TN, FP], [FN, TP]]
        tn, fp = cm[0]
        fn, tp = cm[1]
        
        # Calcula TPR (Recall) e FPR
        # Evita divisão por zero se uma classe não tiver amostras
        tpr = tp / (tp + fn) if (tp + fn) > 0 else 0 # True Positive Rate
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0 # False Positive Rate
        
        rows.append({
            "Sistema": dataset_name,
            "Classificador": model_name,
            "FPR": fpr,
            "TPR": tpr
        })
        
    return pd.DataFrame(rows)


def main():
    try:
        df = load_results(DATA_FILE)
    except FileNotFoundError as e:
        print(f"❌ ERRO: {e}", file=sys.stderr)
        return
    except Exception as e:
        print(f"❌ Erro inesperado ao carregar dados: {e}", file=sys.stderr)
        return
        
    if df.empty:
        print("DataFrame vazio após carregar os dados. Verifique o JSON.")
        return

    plt.figure(figsize=(10, 8))
    sns.set_style("whitegrid")
    
    # Plota os pontos de desempenho
    sns.scatterplot(
        data=df,
        x="FPR",
        y="TPR",
        hue="Sistema",    # Cor por Sistema
        style="Classificador", # Marcador por Classificador
        s=200, # Tamanho do marcador
        palette="Set1",
        edgecolor="black"
    )
    
    # Adiciona a linha de "sorte" (aleatória)
    plt.plot([0, 1], [0, 1], color="black", linestyle="--", lw=1.5, label="Aleatório (AUC=0.5)")
    
    # Adiciona anotações de texto para cada ponto
    for i, row in df.iterrows():
        plt.text(row['FPR'] + 0.01, row['TPR'], f"{row['Classificador']}", fontsize=9)
    
    plt.xlabel("False Positive Rate (FPR)", fontsize=12)
    plt.ylabel("True Positive Rate (TPR / Recall)", fontsize=12)
    plt.title("Desempenho dos Modelos no Espaço ROC", fontsize=16)
    plt.legend(loc="lower right", fontsize=10, bbox_to_anchor=(1, 0))
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.xlim(0, 1)
    plt.ylim(0, 1)
    plt.tight_layout()
    
    save_path = os.path.join(FIGURES_PATH, "roc_curves.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ Gráfico ROC (Pontos) salvo em: {save_path}")

if __name__ == "__main__":
    main()