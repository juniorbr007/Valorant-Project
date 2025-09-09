import pandas as pd
from sklearn.model_selection import cross_validate, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
import json
import warnings
import sys

warnings.filterwarnings('ignore')

def train_and_evaluate_models(csv_path='lol_player_stats.csv', target_game_mode='ALL'):
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        return {"error": f"Arquivo '{csv_path}' não encontrado."}

    if target_game_mode != 'ALL' and 'gameMode' in df.columns:
        df_filtered = df[df['gameMode'] == target_game_mode].copy()
        if df_filtered.empty:
            return {"error": f"Nenhuma partida encontrada para o modo {target_game_mode}."}
        df_processed = df_filtered.drop('gameMode', axis=1)
    else:
        df_processed = df.drop('gameMode', axis=1) if 'gameMode' in df.columns else df

    if len(df_processed) < 10: # Uma verificação inicial de tamanho
        return {"error": f"Dataset muito pequeno ({len(df_processed)} amostras). Mínimo de 10 recomendado."}

    df_encoded = pd.get_dummies(df_processed, columns=['championName'], drop_first=True)
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # --- NOVO: VERIFICAÇÃO DE DIVERSIDADE DE CLASSES ---
    # Garante que temos amostras suficientes de vitórias E derrotas.
    n_splits = min(5, len(df_processed) // 2) # Garante que cada fold tenha pelo menos 2 exemplos
    if n_splits < 2:
        return {"error": f"Dataset muito pequeno para validação cruzada (necessário ao menos 4 amostras)."}

    # Verifica se o número de membros na menor classe é suficiente
    if y.value_counts().min() < n_splits:
        error_message = (f"Não foi possível treinar o modelo. O dataset para o modo '{target_game_mode}' "
                         f"tem apenas {y.value_counts().min()} exemplos da classe minoritária, "
                         f"mas a validação cruzada (k={n_splits}) requer no mínimo {n_splits}.")
        return {"error": error_message}
    
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    models = { 'Random Forest': RandomForestClassifier(random_state=42), 'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42), 'Naive Bayes': GaussianNB() }
    scoring_metrics = ['accuracy', 'precision_macro', 'recall_macro', 'f1_macro']
    results = []
    
    print(f"\nIniciando treinamento com Validacao Cruzada (k={n_splits})...", file=sys.stderr)

    for name, model in models.items():
        cv_results = cross_validate(model, X_scaled, y, cv=cv, scoring=scoring_metrics)
        result = {
            'model_name': name, 'accuracy': round(cv_results['test_accuracy'].mean(), 4),
            'precision': round(cv_results['test_precision_macro'].mean(), 4),
            'recall': round(cv_results['test_recall_macro'].mean(), 4),
            'f1_score': round(cv_results['test_f1_macro'].mean(), 4)
        }
        results.append(result)
        
    return {
        "results": results, "dataset_size": len(df_processed), "cv_folds": cv.get_n_splits()
    }


if __name__ == "__main__":
    target_mode = sys.argv[1] if len(sys.argv) > 1 else 'ALL'
    final_results = train_and_evaluate_models(target_game_mode=target_mode)
    print(json.dumps(final_results, indent=2))
