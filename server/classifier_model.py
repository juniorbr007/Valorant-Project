# server/classifier_model.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import json

# Carrega as variáveis de ambiente
load_dotenv()

def run_classification():
    # 1. CONECTAR AO BANCO DE DADOS
    uri = os.getenv("MONGODB_URI")
    client = MongoClient(uri)
    db = client["valorant-stats"]
    matches_collection = db["matches"]
    
    matches_data = list(matches_collection.find({}))
    
    if len(matches_data) < 20:
        return json.dumps({"error": "Dados insuficientes para classificação."})

    # 2. PREPARAR OS DADOS
    player_stats_list = [match['playerStats'] for match in matches_data]
    df = pd.DataFrame(player_stats_list)
    df['result'] = [match['result'] for match in matches_data] # Adiciona a nossa variável alvo

    # Seleciona as características (features) e a variável alvo (target)
    features = df[['score', 'kills', 'deaths', 'assists', 'headshotPercentage', 'firstKills']]
    target = df['result'].apply(lambda x: 1 if x == 'Vitória' else 0) # Converte Vitória/Derrota para 1/0

    # 3. DIVIDIR OS DADOS EM TREINO E TESTE (Conceito fundamental de ML!)
    # Usaremos 70% dos dados para treinar o modelo e 30% para testar sua performance.
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.3, random_state=42)

    # Normalizar os dados (importante para MLP)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. TREINAR O MODELO MLP (Multilayer Perceptron)
    # Criamos uma rede neural simples com duas camadas ocultas.
    mlp = MLPClassifier(hidden_layer_sizes=(50, 25), max_iter=300, random_state=42)
    mlp.fit(X_train_scaled, y_train)

    # 5. AVALIAR O MODELO
    # Fazemos previsões no conjunto de teste que o modelo nunca viu antes.
    predictions = mlp.predict(X_test_scaled)
    
    # Calculamos a acurácia
    accuracy = accuracy_score(y_test, predictions)
    
    # Criamos a Matriz de Confusão
    # [[Verdadeiro Negativo, Falso Positivo],
    #  [Falso Negativo, Verdadeiro Positivo]]
    cm = confusion_matrix(y_test, predictions)
    
    results = {
        "model": "Multilayer Perceptron (MLP)",
        "accuracy": f"{(accuracy * 100):.2f}%",
        "confusion_matrix": {
            "tn": int(cm[0][0]), "fp": int(cm[0][1]),
            "fn": int(cm[1][0]), "tp": int(cm[1][1])
        },
        "test_set_size": len(X_test)
    }

    # Retorna os resultados como uma string JSON para o Node.js poder ler
    return json.dumps(results)


if __name__ == "__main__":
    # Imprime o resultado no console quando rodamos o script diretamente
    print(run_classification())