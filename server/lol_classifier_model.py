import pandas as pd
from sklearn.model_selection import cross_validate, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
import json
import warnings
import sys # 1. IMPORTAMOS A BIBLIOTECA 'SYS'

warnings.filterwarnings('ignore')

def train_and_evaluate_models(csv_path='lol_player_stats.csv'):
    try:
        df = pd.read_csv(csv_path)
        # 2. MUDAMOS OS PRINTS DE STATUS PARA 'sys.stderr'
        print(f"Dataset '{csv_path}' carregado com sucesso. {len(df)} linhas encontradas.", file=sys.stderr)
    except FileNotFoundError:
        return {"error": f"Arquivo '{csv_path}' não encontrado. Execute o data_miner.py primeiro."}

    df_encoded = pd.get_dummies(df, columns=['championName'], drop_first=True)
    print("Pre-processamento (One-Hot Encoding) concluido.", file=sys.stderr)

    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print("Dados normalizados.", file=sys.stderr)

    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42),
        'Naive Bayes': GaussianNB()
    }
    
    scoring_metrics = ['accuracy', 'precision_macro', 'recall_macro', 'f1_macro']
    results = []
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    print("\nIniciando treinamento com Validacao Cruzada (k=5)...", file=sys.stderr)

    for name, model in models.items():
        cv_results = cross_validate(model, X_scaled, y, cv=cv, scoring=scoring_metrics)
        result = {
            'model_name': name,
            'accuracy': round(cv_results['test_accuracy'].mean(), 4),
            'precision': round(cv_results['test_precision_macro'].mean(), 4),
            'recall': round(cv_results['test_recall_macro'].mean(), 4),
            'f1_score': round(cv_results['test_f1_macro'].mean(), 4)
        }
        results.append(result)
        print(f"-> Modelo '{name}' avaliado.", file=sys.stderr)
        
    print("Treinamento e avaliacao concluidos!", file=sys.stderr)
    return {
        "results": results,
        "dataset_size": len(df),
        "cv_folds": cv.get_n_splits()
    }


if __name__ == "__main__":
    final_results = train_and_evaluate_models()
    
    # 3. ESTE É O ÚNICO PRINT QUE VAI PARA 'stdout'
    # Ele envia apenas o JSON puro, que é o que o Node.js espera.
    print(json.dumps(final_results, indent=2))