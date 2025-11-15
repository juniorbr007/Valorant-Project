# server/cluster_model.py

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import sys
import json
import numpy as np

def run_clustering(matches_json):
    matches_data = json.loads(matches_json)
    
    if len(matches_data) < 3: # KMeans precisa de pelo menos 3 amostras para 3 clusters
        return json.dumps({"error": "Dados insuficientes para clustering."})

    df = pd.DataFrame(matches_data)
    
    # Adiciona o ID original para podermos mapear os resultados de volta
    original_ids = [match.get('id', f'index_{i}') for i, match in enumerate(matches_data)]
    df['original_id'] = original_ids

    features = df[['score', 'kills', 'deaths', 'assists', 'firstKills']]
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(features_scaled)

    # Mapeia os clusters para arquétipos (como antes)
    cluster_centers = kmeans.cluster_centers_
    aggression_scores = cluster_centers[:, 1] + cluster_centers[:, 4] # Kills + First Kills
    cluster_map_indices = np.argsort(aggression_scores)
    archetype_map = {
        cluster_map_indices[0]: "Âncora",
        cluster_map_indices[1]: "Tático",
        cluster_map_indices[2]: "Agressivo"
    }
    df['archetype'] = df['cluster'].map(archetype_map)

    # --- LÓGICA DE RETORNO APRIMORADA ---
    
    # 1. Calcula os dados para o gráfico de pizza (como antes)
    pie_data = df['archetype'].value_counts(normalize=True) * 100
    pie_chart_data = [{'archetype': k, 'percentage': v} for k, v in pie_data.items()]

    # 2. Cria uma lista de classificações para cada partida
    match_classifications = df[['original_id', 'archetype']].to_dict(orient='records')
    # Renomeia 'original_id' para 'id' para consistência
    for item in match_classifications:
        item['id'] = item.pop('original_id')

    # 3. Retorna um objeto contendo AMBAS as informações
    final_result = {
        "pieChartData": pie_chart_data,
        "matchClassifications": match_classifications
    }

    print(json.dumps(final_result))

if __name__ == "__main__":
    run_clustering(sys.argv[1])