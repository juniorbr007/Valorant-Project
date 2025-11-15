import json, os, sys
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
    Carrega os resultados e processa o model_name
    para extrair o Dataset e o Modelo.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} não encontrado.")

    rows = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # --- 2. LÓGICA DE PARSING CORRIGIDA ---
    for r in data.get("results", []):
        full_model_name = r.get("model_name", "Unknown - Unknown")
        
        # Quebra o nome "Sistema - Classificador"
        parts = full_model_name.split(" - ")
        
        if len(parts) == 2:
            dataset = parts[0].strip() # "Cypher's Edge" ou "Literatura 1"
            model = parts[1].strip()   # "Random Forest", "MLP Classifier", etc.
        else:
            dataset = "Unknown" # Fallback
            model = full_model_name
            
        for score in r.get("cv_scores", []):
            # Adiciona as colunas corretas
            rows.append({"Model": model, "Dataset": dataset, "Accuracy": score})
            
    return pd.DataFrame(rows)

def main():
    df = load_results(DATA_FILE)
    
    if df.empty:
        print("DataFrame vazio após carregar os dados. Verifique o JSON.")
        return

    plt.figure(figsize=(12, 7)) # Aumentei um pouco a altura
    sns.set_style("whitegrid")
    
    # Define a ordem dos modelos para consistência
    model_order = ["Random Forest", "MLP Classifier", "Naive Bayes"]
    dataset_order = ["Cypher's Edge", "Literatura 1"]
    
    palette = sns.color_palette("Set2", n_colors=len(dataset_order))
    
    sns.boxplot(x="Model", y="Accuracy", hue="Dataset", data=df, 
                palette=palette, width=0.6, 
                order=model_order, hue_order=dataset_order)
    
    sns.stripplot(x="Model", y="Accuracy", hue="Dataset", data=df, 
                  dodge=True, color='black', alpha=0.5, size=4,
                  order=model_order, hue_order=dataset_order)
    
    plt.title("Distribuição das Acurácias por Modelo e Dataset (10-Fold CV)", fontsize=16)
    plt.ylabel("Acurácia")
    plt.xlabel("Classificador")
    plt.ylim(0, 1.05) # Limite um pouco maior
    
    # Corrige a legenda
    handles, labels = plt.gca().get_legend_handles_labels()
    # Pega apenas as legendas únicas (para evitar duplicatas do stripplot)
    unique_handles_labels = dict(zip(labels, handles))
    plt.legend(unique_handles_labels.values(), unique_handles_labels.keys(), title="Sistema")
    
    plt.xticks(rotation=0) # Rotação 0 fica melhor com 3 modelos
    plt.tight_layout()
    save_path = os.path.join(FIGURES_PATH, "cv_boxplot.png")
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ CV Boxplot salvo em: {save_path}")

if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"❌ ERRO: {e}", file=sys.stderr)
    except Exception as e:
        print(f"❌ Erro inesperado no cv_boxplot: {e}", file=sys.stderr)