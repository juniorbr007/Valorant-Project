import json
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from itertools import combinations
import sys # 

plt.switch_backend("Agg")  # para rodar sem display gráfico

# --- 1. CAMINHO CORRIGIDO ---
DATA_FILE = "results/ml_results.json"
FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

# Tabela de valores q_alpha para Nemenyi 0.05 (aproximado)
# Para k = 2..10 modelos
Q_ALPHA_05 = {2: 1.960, 3: 2.343, 4: 2.569, 5: 2.728,
              6: 2.850, 7: 2.949, 8: 3.031, 9: 3.102, 10: 3.164}

# --- 2. LÓGICA DE LOAD CORRIGIDA ---
def load_results(file_path):
    """
    Lê ml_results.json e retorna um DataFrame com colunas:
    Dataset, Model, Accuracy
    (LÓGICA CORRIGIDA PARA PARSEAR O model_name)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Erro: {file_path} não encontrado.")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    results_list = []
    # Usado para criar um ID de fold único para cada dataset
    fold_counters = {} 

    for r in data.get("results", []):
        full_model_name = r.get("model_name", "Unknown - Unknown")
        
        # Quebra o nome "Sistema - Classificador"
        parts = full_model_name.split(" - ")
        
        if len(parts) == 2:
            dataset_name = parts[0].strip() # "Cypher's Edge" ou "Literatura 1"
            model_name = parts[1].strip()   # "Random Forest", "MLP Classifier", etc.
        else:
            dataset_name = "Unknown" # Fallback
            model_name = full_model_name
            
        if dataset_name not in fold_counters:
            fold_counters[dataset_name] = 0
            
        cv_scores = r.get("cv_scores", [])
        
        # Se os scores de CV são 10, e temos 2 datasets, 
        # o N (número de folds) total será 20
        for score in cv_scores:
            # Adiciona as colunas corretas
            # O 'Fold_ID' é crucial para o pivot_table
            results_list.append({
                "Fold_ID": fold_counters[dataset_name],
                "Dataset": dataset_name, 
                "Model": model_name, 
                "Accuracy": score
            })
            fold_counters[dataset_name] += 1

    df = pd.DataFrame(results_list)
    
    # O Nemenyi precisa de um "fold_id" único por dataset/fold
    # O código acima pode gerar IDs duplicados se os scores não forem lidos em ordem
    # Vamos re-criar o Fold_ID com base no 'cumcount' (contador cumulativo)
    df['Fold_ID'] = df.groupby(['Dataset', 'Model']).cumcount()
    
    return df

def compute_mean_ranks(df):
    """
    Calcula ranks médios por modelo em cada dataset/fold
    """
    # Pivota o DataFrame:
    # Linhas = Folds (0 a 9)
    # Colunas = Modelos (RF, MLP, NB)
    # Valores = Acurácia
    # O 'Dataset' é usado para agrupar os folds
    
    pivot = df.pivot_table(index=['Dataset', 'Fold_ID'], 
                           columns='Model', 
                           values='Accuracy')
    
    pivot = pivot.fillna(pivot.mean())  # preencher NaN se faltar algum fold
    
    # Rank *através* das colunas (axis=1) para cada fold
    # ascending=False -> Maior acurácia = menor rank (ex: rank 1)
    ranks = pivot.rank(axis=1, method='average', ascending=False)
    
    # Calcula a média dos ranks para cada modelo
    mean_ranks = ranks.mean().sort_values(ascending=True) # Nemenyi plota do melhor (esquerda) pro pior (direita)
    return mean_ranks

def compute_cd(k, N, alpha=0.05):
    """
    Calcula Critical Difference (CD) para Nemenyi manualmente
    k = número de classificadores
    N = número de folds * número de datasets
    """
    q_alpha = Q_ALPHA_05.get(k)
    if q_alpha is None:
        q_alpha = 3.164 # fallback
        print(f"Aviso: k={k} > 10, usando q_alpha aproximado.", file=sys.stderr)
        
    cd = q_alpha * np.sqrt(k*(k+1)/(6*N))
    return cd

def generate_nemenyi_plot(df, save_path):
    
    try:
        mean_ranks = compute_mean_ranks(df)
    except Exception as e:
        print(f"❌ Erro ao calcular mean_ranks (verifique o pivot): {e}", file=sys.stderr)
        return
        
    models = mean_ranks.index.tolist()
    ranks = mean_ranks.values
    
    k = len(models) # k = número de classificadores (ex: 3)
    
    # N = número total de observações (folds)
    # (ex: 10 folds * 2 datasets = 20)
    N = len(df['Fold_ID'].unique()) * len(df['Dataset'].unique())

    if k < 2 or N < 1:
        print(f"❌ Erro: Dados insuficientes para o Nemenyi plot (k={k}, N={N}).", file=sys.stderr)
        return
        
    cd = compute_cd(k, N)

    # Plot
    fig, ax = plt.subplots(figsize=(10, 4)) # Ajustado o tamanho
    
    # Limites do plot
    min_rank = ranks.min()
    max_rank = ranks.max()
    plot_min = min_rank - (cd * 0.5) # Adiciona espaço
    plot_max = max_rank + (cd * 0.5)

    # Linha principal para os ranks
    ax.hlines(1, plot_min, plot_max, color='black', lw=1.5, zorder=1)

    # Plot dos modelos
    for i, (model, rank) in enumerate(zip(models, ranks)):
        ax.plot(rank, 1, 'o', markersize=12, color="#005f73", mec="black", mew=1.2, zorder=3)
        ax.text(rank, 1.05, model, rotation=45, ha="center", va="bottom", fontsize=11)

    # Linhas de Critical Difference (CD)
    # Plota uma barra de CD para cada grupo de modelos que não são significativamente diferentes
    
    # Encontra grupos de modelos que não são diferentes
    groups = []
    for m1, m2 in combinations(range(k), 2):
        if abs(ranks[m1] - ranks[m2]) <= cd:
            groups.append((ranks[m1], ranks[m2]))

    # Simplifica os grupos para desenhar menos linhas
    if groups:
        # Ordena os grupos pela posição inicial
        groups.sort()
        merged_groups = [list(groups[0])]

        for current_start, current_end in groups[1:]:
            last_start, last_end = merged_groups[-1]
            # Se o grupo atual se sobrepõe ou é adjacente ao último, mescla
            if current_start <= last_end:
                merged_groups[-1][1] = max(last_end, current_end)
            else:
                merged_groups.append([current_start, current_end])
        
        # Plota as barras de CD
        bar_height = 0.9
        for start, end in merged_groups:
            ax.plot([start, end], [bar_height, bar_height], color="red", linewidth=3)

    # Adiciona uma barra de CD de referência
    ax.plot([plot_min + 0.1, plot_min + 0.1 + cd], [0.8, 0.8], color="black", lw=3)
    ax.text(plot_min + 0.1 + (cd/2), 0.77, f"CD = {cd:.3f} (p=0.05)", 
            color="black", ha="center", va="top", fontsize=10)

    ax.set_ylim(0.7, 1.3)
    ax.set_xlim(plot_min, plot_max)
    ax.axis('off') # Remove eixos
    ax.set_title(f"Teste Pós-Hoc de Nemenyi (k={k}, N={N})", fontsize=14, loc='left')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"✔ Nemenyi plot salvo em: {save_path}")

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
        
    save_path = os.path.join(FIGURES_PATH, "nemenyi_plot_manual.png")
    generate_nemenyi_plot(df, save_path)

if __name__ == "__main__":
    main()