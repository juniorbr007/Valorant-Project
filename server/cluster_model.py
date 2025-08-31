# server/cluster_model.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Carrega as variáveis de ambiente (nosso MONGODB_URI) do arquivo .env
load_dotenv()

def run_clustering():
    # 1. CONECTAR AO BANCO DE DADOS
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client["valorant-stats"]
    matches_collection = db["matches"] # Supondo que salvaremos as partidas aqui
    
    # Busca todas as partidas do banco de dados (limitado a 1000 por segurança)
    matches_data = list(matches_collection.find({}).limit(1000))
    
    if len(matches_data) < 10: # O K-Means precisa de um mínimo de dados
        print("Dados insuficientes para clustering.")
        return

    print(f"Encontradas {len(matches_data)} partidas para analisar.")

    # 2. PREPARAR OS DADOS COM PANDAS
    # Criamos um DataFrame (uma tabela) com as estatísticas do jogador
    player_stats_list = [match['playerStats'] for match in matches_data]
    df = pd.DataFrame(player_stats_list)

    # Seleciona as características (features) que vamos usar no modelo
    features = df[['score', 'kills', 'deaths', 'assists', 'headshotPercentage', 'firstKills']]
    
    # 3. PRÉ-PROCESSAMENTO (MUITO IMPORTANTE PARA K-MEANS)
    # Normalizamos os dados para que todas as features tenham a mesma escala
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    # 4. TREINAR O MODELO K-MEANS
    # Vamos agrupar as partidas em 3 clusters (estilos de jogo)
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans.fit(scaled_features)
    
    # Adiciona os resultados (os clusters) de volta ao nosso DataFrame
    df['cluster'] = kmeans.labels_

    # Mapeia os números do cluster (0, 1, 2) para nomes que fazem sentido
    cluster_map = {0: 'Tático', 1: 'Agressivo', 2: 'Suporte'} # Este mapeamento pode variar
    df['predictedCluster'] = df['cluster'].map(cluster_map)

    print("Clustering concluído. Atualizando o banco de dados...")

    # 5. ATUALIZAR O BANCO DE DADOS COM OS RESULTADOS
    for index, row in df.iterrows():
        match_id = matches_data[index]['matchId']
        cluster_result = row['predictedCluster']
        
        # Atualiza o documento da partida no MongoDB com o novo campo
        matches_collection.update_one(
            {'matchId': match_id},
            {'$set': {'predictedCluster': cluster_result}}
        )

    print("Banco de dados atualizado com os resultados do clustering!")


if __name__ == "__main__":
    run_clustering()