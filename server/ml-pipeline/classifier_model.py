# server/classifier_model.py

import os
import json
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import RepeatedStratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# Carrega variáveis de ambiente (.env)
load_dotenv()

def run_classification():
    """Executa classificação e retorna resultados em formato JSON."""
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client["valorant-stats"]
    matches_collection = db["matches"]
    matches_data = list(matches_collection.find({}))

    if len(matches_data) < 50:
        return json.dumps({"error": "Dados insuficientes para validação cruzada."})

    # =============================
    # Pré-processamento dos dados
    # =============================
    player_stats_list = []
    for match in matches_data:
        stats = match['playerStats']
        kills = stats.get('kills', 0)
        deaths = stats.get('deaths', 1)
        assists = stats.get('assists', 0)
        effective_deaths = deaths if deaths > 0 else 1
        stats['kda_ratio'] = (kills + assists) / effective_deaths
        player_stats_list.append(stats)

    df = pd.DataFrame(player_stats_list)
    df['result'] = [m['result'] for m in matches_data]

    features = df[['score', 'kills', 'deaths', 'assists', 'headshotPercentage', 'firstKills', 'kda_ratio']].fillna(0)
    target = df['result'].apply(lambda x: 1 if x == 'Vitória' else 0)

    # =============================
    # Configuração de Validação
    # =============================
    RANDOM_STATE = 42
    n_splits = 10
    n_repeats = 10
    rskf = RepeatedStratifiedKFold(n_splits=n_splits, n_repeats=n_repeats, random_state=RANDOM_STATE)

    models_to_run = {
        "Multilayer Perceptron (MLP)": MLPClassifier(hidden_layer_sizes=(50, 25), max_iter=500, random_state=RANDOM_STATE),
        "Naive Bayes Gaussiano": GaussianNB(),
        "Árvore de Decisão": DecisionTreeClassifier(random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(random_state=RANDOM_STATE, n_estimators=100)
    }

    all_results = []

    # =============================
    # Loop principal de avaliação
    # =============================
    for name, model in models_to_run.items():
        pipeline = make_pipeline(StandardScaler(), model)

        acc_scores = cross_val_score(pipeline, features, target, cv=rskf, scoring='accuracy', n_jobs=-1)
        prec_scores = cross_val_score(pipeline, features, target, cv=rskf, scoring='precision', n_jobs=-1)
        rec_scores = cross_val_score(pipeline, features, target, cv=rskf, scoring='recall', n_jobs=-1)
        f1_scores = cross_val_score(pipeline, features, target, cv=rskf, scoring='f1', n_jobs=-1)

        model_scores = {
            "model_name": name,
            "cv_scores": [float(x) for x in acc_scores.tolist()],
            "accuracy": float(acc_scores.mean()),
            "precision": float(prec_scores.mean()),
            "recall": float(rec_scores.mean()),
            "f1_score": float(f1_scores.mean()),
            "std_accuracy": float(acc_scores.std()),
            "std_precision": float(prec_scores.std()),
            "std_recall": float(rec_scores.std()),
            "std_f1_score": float(f1_scores.std())
        }

        all_results.append(model_scores)

    # =============================
    # Retorno final
    # =============================
    final_output = {
        "results": all_results,
        "dataset_size": int(len(features)),
        "cv_folds": n_splits * n_repeats  # 100 folds (10x10)
    }

    return json.dumps(final_output)

# =============================
# Execução direta
# =============================
if __name__ == "__main__":
    print(run_classification())
