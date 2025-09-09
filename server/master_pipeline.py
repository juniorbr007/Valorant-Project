import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
from sklearn.model_selection import cross_val_predict, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix, classification_report
import warnings
import json

# --- Esta é a junção dos nossos dois scripts anteriores ---

warnings.filterwarnings('ignore')
load_dotenv()

def run_full_pipeline(target_puuid, target_game_mode='ALL'):
    """
    Executa a pipeline completa: conecta ao DB, minera os dados
    para um jogador específico, treina os modelos e retorna os resultados.
    """
    # --- Parte 1: Mineração de Dados (lógica do data_miner.py) ---
    try:
        uri = os.getenv("MONGODB_URI")
        client = MongoClient(uri)
        db = client.get_default_database()
        matches_collection = db["lol_raw_matches"]
    except Exception as e:
        return {"error": f"Erro ao conectar ao MongoDB: {e}"}

    all_matches_cursor = matches_collection.find({ "info.participants.puuid": target_puuid })
    all_matches_list = list(all_matches_cursor)

    if not all_matches_list:
        return {"error": f"Nenhuma partida encontrada para o jogador."}
        
    player_specific_data = []
    for match in all_matches_list:
        if 'info' not in match or 'participants' not in match['info']: continue
        game_mode = match['info'].get('gameMode')
        for p in match['info']['participants']:
            if p.get('puuid') == target_puuid:
                player_specific_data.append({
                    'gameMode': game_mode, 'win': 1 if p.get('win') else 0,
                    'championName': p.get('championName'), 'kills': p.get('kills'),
                    'deaths': p.get('deaths'), 'assists': p.get('assists'),
                    'goldEarned': p.get('goldEarned'), 'totalMinionsKilled': p.get('totalMinionsKilled'),
                    'visionScore': p.get('visionScore'), 'wardsPlaced': p.get('wardsPlaced'),
                    'totalDamageDealtToChampions': p.get('totalDamageDealtToChampions'),
                    'turretTakedowns': p.get('turretTakedowns'),
                })
                break
    
    df = pd.DataFrame(player_specific_data)

    # --- Parte 2: Treinamento do Modelo (lógica do lol_classifier_model.py) ---
    if target_game_mode != 'ALL' and 'gameMode' in df.columns:
        df = df[df['gameMode'] == target_game_mode].copy()
    if 'gameMode' in df.columns:
        df = df.drop('gameMode', axis=1)

    if len(df) < 10:
        return {"error": f"Dataset pequeno demais ({len(df)} amostras). Mínimo de 10."}
    
    df_encoded = pd.get_dummies(df, columns=['championName'], drop_first=True)
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    n_splits = min(5, len(df) // 2)
    if n_splits < 2 or y.value_counts().min() < n_splits:
        return {"error": f"Dados insuficientes para validação cruzada no modo '{target_game_mode}'."}

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    models = { 'Random Forest': RandomForestClassifier(random_state=42), 'MLP Classifier': MLPClassifier(max_iter=1000, random_state=42), 'Naive Bayes': GaussianNB() }
    results = []
    
    for name, model in models.items():
        y_pred = cross_val_predict(model, X_scaled, y, cv=cv)
        cm = confusion_matrix(y, y_pred)
        report = classification_report(y, y_pred, target_names=['Derrota', 'Vitória'], output_dict=True)
        results.append({
            'model_name': name, 'accuracy': report['accuracy'],
            'precision': report['macro avg']['precision'],
            'recall': report['macro avg']['recall'], 'f1_score': report['macro avg']['f1-score'],
            'confusion_matrix': cm.tolist(),
            'classification_report': {'loss': report['Derrota'], 'win': report['Vitória']}
        })
        
    return {"results": results, "dataset_size": len(df), "cv_folds": cv.get_n_splits()}


if __name__ == "__main__":
    # O script agora espera PUUID e gameMode como argumentos
    player_puuid = sys.argv[1] if len(sys.argv) > 1 else None
    game_mode = sys.argv[2] if len(sys.argv) > 2 else 'ALL'
    
    if not player_puuid:
        print(json.dumps({"error": "PUUID do jogador não foi fornecido."}))
    else:
        final_results = run_full_pipeline(player_puuid, game_mode)
        print(json.dumps(final_results, indent=2))