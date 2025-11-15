import pandas as pd
from sklearn.model_selection import cross_val_predict, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix, classification_report
import json
import warnings
import sys
import numpy as np
import joblib  # <-- ADICIONADO
import os      # <-- ADICIONADO

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

    # --- Pré-processamento ---
    df_encoded = pd.get_dummies(final_df, columns=['championName'], drop_first=True)
    
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    n_splits = 10
    
    if len(final_df) < n_splits or y.value_counts().min() < n_splits:
        n_splits = 5 
        print(f"Aviso: Dados insuficientes para 10 folds. Usando k={n_splits}.", file=sys.stderr)
        if len(final_df) < n_splits or y.value_counts().min() < n_splits:
            print(f"Erro fatal: Dados insuficientes para validação cruzada (k=5).", file=sys.stderr)
            return {"error": f"Dados insuficientes para validação cruzada no modo '{target_game_mode}'."}

    
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    
    results = []
    
    print(f"Iniciando AVALIAÇÃO no dataset '{csv_path}' (k={n_splits})...", file=sys.stderr)

    for name, model in models.items():
        cv_scores = cross_val_score(model, X_scaled, y, cv=cv, scoring='accuracy')
        
        y_pred = cross_val_predict(model, X_scaled, y, cv=cv)
        cm = confusion_matrix(y, y_pred)
        report = classification_report(y, y_pred, target_names=['Derrota', 'Vitória'], output_dict=True, zero_division=0)
        
        results.append({
            'model_name': name,
            'accuracy': report['accuracy'],
            'cv_scores': cv_scores.tolist(),
            'precision': report['macro avg']['precision'],
            'recall': report['macro avg']['recall'],
            'f1_score': report['macro avg']['f1-score'],
            'confusion_matrix': cm.tolist(),
            'classification_report': {'loss': report['Derrota'], 'win': report['Vitória']}
        })
        print(f"-> Modelo '{name}' avaliado.", file=sys.stderr)
        
    print(f"Avaliação do dataset '{csv_path}' concluída!", file=sys.stderr)
    return {
        "results": results, 
        "dataset_size": len(final_df), 
        "cv_folds": cv.get_n_splits()
    }

# ---
# --- NOVA FUNÇÃO PARA SALVAR O MODELO DE PRODUÇÃO ---
# ---
def train_and_save_production_model(csv_path, target_game_mode='ALL'):
    """
    Carrega o dataset principal, treina o MELHOR modelo (ex: Random Forest)
    em TODOS os dados e salva os arquivos para o predict_model.py.
    """
    print("\n" + "="*50, file=sys.stderr)
    print("INICIANDO TREINAMENTO DO MODELO DE PRODUÇÃO", file=sys.stderr)
    print(f"Dataset: {csv_path}", file=sys.stderr)
    print(f"Modo: {target_game_mode}", file=sys.stderr)
    print("="*50, file=sys.stderr)
    
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"❌ ERRO: Arquivo de produção '{csv_path}' não encontrado.", file=sys.stderr)
        return False
        
    # --- 1. Pré-processamento (EXATAMENTE IGUAL AO DA AVALIAÇÃO) ---
    if target_game_mode != 'ALL' and 'gameMode' in df.columns:
        df_processed = df[df['gameMode'] == target_game_mode].copy()
    else:
        df_processed = df.copy()

    final_df = df_processed.drop('gameMode', axis=1) if 'gameMode' in df_processed.columns else df_processed.copy()

    # Aplica o get_dummies
    df_encoded = pd.get_dummies(final_df, columns=['championName'], drop_first=True)
    
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    # Salva a lista de colunas (VITAL para a predição)
    model_columns = X.columns.tolist()
    
    # --- 2. Treina o Scaler e Salva ---
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Define os caminhos de saída
    output_dir = "models_saved"
    os.makedirs(output_dir, exist_ok=True) # Cria a pasta se não existir
    
    scaler_path = os.path.join(output_dir, 'lol_scaler.joblib')
    joblib.dump(scaler, scaler_path)
    print(f"✅ Scaler de produção salvo em: {scaler_path}", file=sys.stderr)
    
    # Salva as colunas
    columns_path = os.path.join(output_dir, 'lol_model_columns.json')
    with open(columns_path, 'w') as f:
        json.dump(model_columns, f)
    print(f"✅ Colunas do modelo salvas em: {columns_path}", file=sys.stderr)

    # --- 3. Treina o Modelo e Salva ---
    # (Escolhemos o RandomForest como modelo de produção. Mude aqui se quiser.)
    model = RandomForestClassifier(random_state=42)
    model.fit(X_scaled, y)
    
    model_path = os.path.join(output_dir, 'lol_model.joblib')
    joblib.dump(model, model_path)
    print(f"✅ Modelo de produção salvo em: {model_path}", file=sys.stderr)
    print("="*50, file=sys.stderr)
    return True


# --- __main__ MODIFICADO ---
if __name__ == "__main__":
    target_mode = sys.argv[1] if len(sys.argv) > 1 else 'ALL'
    
    # === PARTE 1: AVALIAÇÃO (O que você já tinha) ===
    experiments = [
        ("Cypher's Edge", "data/input/dataset.csv"), # Caminho corrigido
        ("Literatura 1", "data/literature/dataset_literatura_1.csv") # Caminho corrigido
    ]
    
    all_results = []
    final_dataset_size = 0
    final_cv_folds = 0
    
    print("="*50, file=sys.stderr)
    print(f"INICIANDO COMPARAÇÃO DE SISTEMAS HÍBRIDOS (AVALIAÇÃO)", file=sys.stderr)
    print(f"Modo de Jogo: {target_mode}", file=sys.stderr)
    print("="*50, file=sys.stderr)

    for system_name, csv_file in experiments:
        print(f"\n--- Processando Sistema: {system_name} ---", file=sys.stderr)
        
        exp_data = run_experiment_on_dataset(csv_path=csv_file, target_game_mode=target_mode)
        
        if "error" in exp_data:
            print(f"Erro ao processar {system_name}: {exp_data['error']}", file=sys.stderr)
            sys.exit(1)
        
        # (Usa o 'dataset_size' do primeiro experimento por padrão)
        if system_name == "Cypher's Edge":
            final_dataset_size = exp_data["dataset_size"]
            final_cv_folds = exp_data["cv_folds"]
        
        for res in exp_data["results"]:
            res['model_name'] = f"{system_name} - {res['model_name']}"
            all_results.append(res)
            
    final_output = {
        "results": all_results,
        "dataset_size": final_dataset_size,
        "cv_folds": final_cv_folds
    }
    
    # Salva o JSON de AVALIAÇÃO
    output_json_path = 'results/ml_results.json' # Caminho corrigido
    os.makedirs('results', exist_ok=True) # Cria a pasta se não existir
    with open(output_json_path, 'w') as outfile:
        json.dump(final_output, outfile, indent=2)
    
    print("\n" + "="*50, file=sys.stderr)
    print("COMPARAÇÃO (AVALIAÇÃO) CONCLUÍDA!", file=sys.stderr)
    print(f"Resultados de avaliação salvos em: {output_json_path}", file=sys.stderr)
    print("="*50, file=sys.stderr)
    
    # === PARTE 2: TREINAMENTO (A parte nova) ===
    # Vamos treinar o modelo de produção usando o seu dataset principal
    success = train_and_save_production_model(
        csv_path="data/input/dataset.csv", # Caminho corrigido
        target_game_mode=target_mode
    )
    
    if not success:
        print("❌ Falha ao treinar o modelo de produção.", file=sys.stderr)
        sys.exit(1)
        
    print("\nScript finalizado. Modelo de produção pronto para uso.", file=sys.stderr)
    
    # Imprime no stdout apenas o resultado da avaliação (para o Node.js)
    print(json.dumps(final_output, indent=2))