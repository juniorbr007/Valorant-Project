# server/train_and_save_model.py

import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib # Biblioteca para salvar o modelo
from pymongo import MongoClient
from dotenv import load_dotenv
import os

def train_and_save():
    print("Iniciando o processo de treinamento final...")

    # Carrega os dados do MongoDB
    load_dotenv()
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client["valorant-stats"]
    matches_data = list(db["matches"].find({}))
    print(f"Encontrados {len(matches_data)} registros no banco de dados.")

    # Prepara os dados (exatamente como antes)
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

    # --- Treinamento Final ---
    # 1. Prepara o Scaler com TODOS os dados
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    print("StandardScaler treinado com todos os dados.")

    # 2. Treina o modelo Random Forest com TODOS os dados
    model = RandomForestClassifier(random_state=42)
    model.fit(features_scaled, target)
    print("Modelo Random Forest final treinado.")

    # --- Salvando os artefatos ---
    # 3. Salva o modelo treinado em um arquivo
    joblib.dump(model, 'production_model.joblib')
    print("Modelo salvo em 'production_model.joblib'")

    # 4. Salva o scaler treinado em um arquivo (MUITO IMPORTANTE)
    joblib.dump(scaler, 'scaler.joblib')
    print("Scaler salvo em 'scaler.joblib'")

    print("\nProcesso concluído com sucesso!")

if __name__ == "__main__":
    train_and_save()