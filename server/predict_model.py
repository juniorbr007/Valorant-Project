# server/predict_model.py
import joblib
import pandas as pd
import sys
import json

def predict(data):
    # Carrega o modelo e o scaler dos arquivos
    model = joblib.load('production_model.joblib')
    scaler = joblib.load('scaler.joblib')

    # Calcula o KDA Ratio para os novos dados
    kills = data.get('kills', 0)
    deaths = data.get('deaths', 1)
    assists = data.get('assists', 0)
    effective_deaths = deaths if deaths > 0 else 1
    data['kda_ratio'] = (kills + assists) / effective_deaths

    # Converte os dados para o formato que o modelo espera (DataFrame)
    input_df = pd.DataFrame([data])
    # Garante que as colunas estão na ordem correta
    feature_order = ['score', 'kills', 'deaths', 'assists', 'headshotPercentage', 'firstKills', 'kda_ratio']
    input_df = input_df[feature_order]

    # Escala os dados usando o MESMO scaler do treinamento
    input_scaled = scaler.transform(input_df)

    # Faz a previsão
    prediction_code = model.predict(input_scaled)[0]
    prediction_text = "Vitória" if prediction_code == 1 else "Derrota"

    # Obtém a probabilidade da previsão
    probabilities = model.predict_proba(input_scaled)[0]
    confidence = probabilities.max() * 100

    # Retorna o resultado como JSON
    result = {
        "prediction": prediction_text,
        "confidence": f"{confidence:.2f}%"
    }
    print(json.dumps(result))

if __name__ == "__main__":
    # Pega os dados de entrada do Node.js
    input_data = json.loads(sys.argv[1])
    predict(input_data)