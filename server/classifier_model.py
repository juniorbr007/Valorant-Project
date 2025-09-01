# server/classifier_model.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
from sklearn.preprocessing import StandardScaler
import json

from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

load_dotenv()

def run_classification():
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client["valorant-stats"]
    matches_collection = db["matches"]
    matches_data = list(matches_collection.find({}))
    
    if len(matches_data) < 50: 
        return json.dumps({"error": "Dados insuficientes para validação cruzada."})

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

    features = df[['score', 'kills', 'deaths', 'assists', 'headshotPercentage', 'firstKills', 'kda_ratio']]
    target = df['result'].apply(lambda x: 1 if x == 'Vitória' else 0)
    
    all_results = []
    models_to_run = {
        "Multilayer Perceptron (MLP)": MLPClassifier(hidden_layer_sizes=(50, 25), max_iter=500, random_state=42),
        "Naive Bayes Gaussiano": GaussianNB(),
        "Árvore de Decisão": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(random_state=42)
    }

    # --- LÓGICA DE VALIDAÇÃO ATUALIZADA ---
    for name, model in models_to_run.items():
        pipeline = make_pipeline(StandardScaler(), model)
        
        # Define as métricas que queremos calcular
        metrics_to_calculate = ['accuracy', 'precision', 'recall', 'f1']
        model_scores = {"model": name}

        # Roda a validação cruzada para cada métrica
        for metric in metrics_to_calculate:
            scores = cross_val_score(pipeline, features, target, cv=5, scoring=metric)
            
            mean_score = scores.mean()
            std_dev = scores.std()
            
            # Adiciona a média e o desvio padrão ao dicionário de resultados
            if metric == 'f1': # F1-score não é uma porcentagem
                model_scores[f'mean_{metric}'] = f"{mean_score:.3f}"
                model_scores[f'std_{metric}'] = f"± {std_dev:.3f}"
            else: # As outras são porcentagens
                model_scores[f'mean_{metric}'] = f"{(mean_score * 100):.2f}%"
                model_scores[f'std_{metric}'] = f"± {(std_dev * 100):.2f}%"

        all_results.append(model_scores)

    final_output = { 
        "results": all_results, 
        "dataset_size": len(features),
        "cv_folds": 5
    }
    return json.dumps(final_output)

if __name__ == "__main__":
    print(run_classification())