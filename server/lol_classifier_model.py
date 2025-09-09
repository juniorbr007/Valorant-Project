import pandas as pd
from sklearn.model_selection import cross_val_predict, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix, classification_report # Novas importações
import json
import warnings
import sys

warnings.filterwarnings('ignore')

def train_and_evaluate_models(csv_path='lol_player_stats.csv', target_game_mode='ALL'):
    """
    Carrega o dataset, pré-processa, treina os modelos e retorna uma
    análise de performance detalhada, incluindo Matriz de Confusão.
    """
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        return {"error": f"Arquivo '{csv_path}' não encontrado."}

    # Filtro por modo de jogo
    if target_game_mode != 'ALL' and 'gameMode' in df.columns:
        df_filtered = df[df['gameMode'] == target_game_mode].copy()
        if df_filtered.empty:
            return {"error": f"Nenhuma partida encontrada para o modo {target_game_mode}."}
        df_processed = df_filtered.drop('gameMode', axis=1)
    else:
        df_processed = df.drop('gameMode', axis=1) if 'gameMode' in df.columns else df

    if len(df_processed) < 10:
        return {"error": f"Dataset muito pequeno ({len(df_processed)} amostras). Mínimo de 10 recomendado."}

    # Pré-processamento e divisão dos dados
    df_encoded = pd.get_dummies(df_processed, columns=['championName'], drop_first=True)
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    n_splits = min(5, len(df_processed) // 2)
    if n_splits < 2:
        return {"error": "Dataset muito pequeno para validação cruzada."}
    if y.value_counts().min() < n_splits:
        return {"error": f"Não foi possível treinar. O dataset para o modo '{target_game_mode}' tem apenas {y.value_counts().min()} exemplos da classe minoritária, mas k={n_splits} requer no mínimo {n_splits}."}
    
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    models = { 'Random Forest': RandomForestClassifier(random_state=42), 'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42), 'Naive Bayes': GaussianNB() }
    results = []
    
    print(f"\nIniciando treinamento e análise detalhada (k={n_splits})...", file=sys.stderr)

    for name, model in models.items():
        # --- ANÁLISE DETALHADA ---
        
        # 1. Gera predições para cada amostra usando validação cruzada
        # Isso nos dá uma previsão "honesta" para cada linha do dataset
        y_pred = cross_val_predict(model, X_scaled, y, cv=cv)

        # 2. Calcula a Matriz de Confusão com base nessas predições
        # Formato: [[Verdadeiro Negativo, Falso Positivo], [Falso Negativo, Verdadeiro Positivo]]
        cm = confusion_matrix(y, y_pred)
        
        # 3. Gera o Relatório de Classificação completo como um dicionário
        report = classification_report(y, y_pred, target_names=['Derrota', 'Vitória'], output_dict=True)

        # 4. Monta o objeto de resultado com os novos dados ricos
        results.append({
            'model_name': name,
            'accuracy': report['accuracy'],
            'precision': report['macro avg']['precision'],
            'recall': report['macro avg']['recall'],
            'f1_score': report['macro avg']['f1-score'],
            'confusion_matrix': cm.tolist(), # Converte para lista para ser serializável em JSON
            'classification_report': {
                # Pegamos os detalhes para cada classe (0='Derrota', 1='Vitória')
                'loss': report['Derrota'],
                'win': report['Vitória']
            }
        })
        print(f"-> Modelo '{name}' analisado detalhadamente.", file=sys.stderr)
        
    print("Análise detalhada concluída!", file=sys.stderr)
    return {
        "results": results, 
        "dataset_size": len(df_processed), 
        "cv_folds": cv.get_n_splits()
    }


if __name__ == "__main__":
    target_mode = sys.argv[1] if len(sys.argv) > 1 else 'ALL'
    final_results = train_and_evaluate_models(target_game_mode=target_mode)
    # Salva o dicionário de resultados em um arquivo JSON
    with open('ml_results.json', 'w') as outfile:
        json.dump(final_results, outfile, indent=2)
    
    # Continua imprimindo na tela para o backend do Node.js funcionar como antes
    print(json.dumps(final_results, indent=2))
