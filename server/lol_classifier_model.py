import pandas as pd
from sklearn.model_selection import cross_val_predict, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
# Removido: from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report
import json
import warnings
import sys
import numpy as np

warnings.filterwarnings('ignore')

def run_experiment_on_dataset(csv_path='lol_player_stats.csv', target_game_mode='ALL'):
    """
    Carrega UM dataset, pré-processa, treina os modelos (RF, MLP, NB)
    e retorna os resultados detalhados para ESSE dataset.
    """
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Erro: Arquivo '{csv_path}' não encontrado.", file=sys.stderr)
        return {"error": f"Arquivo '{csv_path}' não encontrado."}

    # Filtro por modo de jogo
    if target_game_mode != 'ALL' and 'gameMode' in df.columns:
        df_filtered = df[df['gameMode'] == target_game_mode].copy()
        if df_filtered.empty:
            print(f"Aviso: Nenhuma partida encontrada para o modo {target_game_mode} no arquivo {csv_path}.", file=sys.stderr)
            return {"error": f"Nenhuma partida encontrada para o modo {target_game_mode}."}
        df_processed = df_filtered
    else:
        df_processed = df.copy()

    final_df = df_processed.drop('gameMode', axis=1) if 'gameMode' in df_processed.columns else df_processed.copy()

    if len(final_df) < 10:
        return {"error": f"Dataset muito pequeno ({len(final_df)} amostras). Mínimo de 10 recomendado."}

    # --- MUDANÇA: Pré-processamento ---
    # Agora X são TODAS as colunas, exceto 'win' e 'championName'
    # O 'championName' será tratado pelo get_dummies
    
    df_encoded = pd.get_dummies(final_df, columns=['championName'], drop_first=True)
    
    # X são todas as colunas exceto a resposta 'win'
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # --- MUDANÇA: n_splits agora é fixo em 10, conforme seu artigo ---
    # O StratifiedKFold lidará com menos amostras se necessário, mas 10 é o padrão de CV.
    n_splits = 10
    
    # Garante que temos dados suficientes para 10 folds
    if len(final_df) < n_splits or y.value_counts().min() < n_splits:
        # Se não tiver, reduz para 5 (mínimo comum)
        n_splits = 5 
        print(f"Aviso: Dados insuficientes para 10 folds. Usando k={n_splits}.", file=sys.stderr)
        if len(final_df) < n_splits or y.value_counts().min() < n_splits:
            print(f"Erro fatal: Dados insuficientes para validação cruzada (k=5).", file=sys.stderr)
            return {"error": f"Dados insuficientes para validação cruzada no modo '{target_game_mode}'."}

    
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    # --- MUDANÇA: Removido 'Logistic Regression' ---
    # O professor quer a comparação dos métodos híbridos (definidos pelos dados),
    # não uma comparação de classificadores prontos.
    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    
    results = []
    
    print(f"Iniciando treinamento no dataset '{csv_path}' (k={n_splits})...", file=sys.stderr)

    for name, model in models.items():
        # Captura os scores de acurácia de cada fold
        cv_scores = cross_val_score(model, X_scaled, y, cv=cv, scoring='accuracy')
        
        y_pred = cross_val_predict(model, X_scaled, y, cv=cv)
        cm = confusion_matrix(y, y_pred)
        report = classification_report(y, y_pred, target_names=['Derrota', 'Vitória'], output_dict=True, zero_division=0)
        
        results.append({
            'model_name': name, # O 'main' vai adicionar o prefixo do experimento
            'accuracy': report['accuracy'],
            'cv_scores': cv_scores.tolist(), # Essencial para o Teste de Nemenyi
            'precision': report['macro avg']['precision'],
            'recall': report['macro avg']['recall'],
            'f1_score': report['macro avg']['f1-score'],
            'confusion_matrix': cm.tolist(),
            'classification_report': {'loss': report['Derrota'], 'win': report['Vitória']}
        })
        print(f"-> Modelo '{name}' analisado.", file=sys.stderr)
        
    print(f"Análise do dataset '{csv_path}' concluída!", file=sys.stderr)
    return {
        "results": results, 
        "dataset_size": len(final_df), 
        "cv_folds": cv.get_n_splits()
    }

# --- NOVO: __main__ agora orquestra os experimentos ---
if __name__ == "__main__":
    target_mode = sys.argv[1] if len(sys.argv) > 1 else 'ALL'
    
    # Define os experimentos que queremos rodar
    # Cada um é um ("Nome do Sistema", "Arquivo CSV")
    experiments = [
        ("Cypher's Edge", "lol_player_stats.csv"),
        ("Literatura 1", "dataset_literatura_1.csv")
    ]
    
    all_results = []
    final_dataset_size = 0
    final_cv_folds = 0
    
    print("="*50, file=sys.stderr)
    print(f"INICIANDO COMPARAÇÃO DE SISTEMAS HÍBRIDOS", file=sys.stderr)
    print(f"Modo de Jogo: {target_mode}", file=sys.stderr)
    print("="*50, file=sys.stderr)

    for system_name, csv_file in experiments:
        print(f"\n--- Processando Sistema: {system_name} ---", file=sys.stderr)
        
        exp_data = run_experiment_on_dataset(csv_path=csv_file, target_game_mode=target_mode)
        
        if "error" in exp_data:
            print(f"Erro ao processar {system_name}: {exp_data['error']}", file=sys.stderr)
            # Se um falhar, paramos tudo
            sys.exit(1)
        
        final_dataset_size = exp_data["dataset_size"]
        final_cv_folds = exp_data["cv_folds"]
        
        # Adiciona os resultados à lista geral, prefixando o nome do modelo
        for res in exp_data["results"]:
            res['model_name'] = f"{system_name} - {res['model_name']}"
            all_results.append(res)
            
    # Prepara o JSON final para o statistical_analysis.py
    final_output = {
        "results": all_results,
        "dataset_size": final_dataset_size,
        "cv_folds": final_cv_folds
    }
    
    # Salva o arquivo JSON unificado
    output_json_path = 'ml_results.json'
    with open(output_json_path, 'w') as outfile:
        json.dump(final_output, outfile, indent=2)
    
    print("\n" + "="*50, file=sys.stderr)
    print("COMPARAÇÃO CONCLUÍDA!", file=sys.stderr)
    print(f"Resultados de todos os {len(all_results)} sistemas/modelos salvos em: {output_json_path}", file=sys.stderr)
    print("="*50, file=sys.stderr)
    
    # Imprime no stdout para o Node.js capturar
    print(json.dumps(final_output, indent=2))