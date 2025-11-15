import joblib
import pandas as pd
import sys
import json
import argparse
import os

# --- CAMINHOS (AGORA PARA O MODELO DE LOL) ---
MODEL_DIR = 'models_saved'
MODEL_PATH = os.path.join(MODEL_DIR, 'lol_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'lol_scaler.joblib')
COLUMNS_PATH = os.path.join(MODEL_DIR, 'lol_model_columns.json') # <-- MUITO IMPORTANTE

def check_model_files_exist():
    """Verifica se os 3 arquivos do modelo de LoL existem."""
    if not os.path.exists(MODEL_PATH):
        print(f"❌ ERRO: Modelo de LoL não encontrado em {MODEL_PATH}", file=sys.stderr)
        print(f"   -> Você já rodou o script de treino (lol_classifier_model.py)?", file=sys.stderr)
        return False
    if not os.path.exists(SCALER_PATH):
        print(f"❌ ERRO: Scaler de LoL não encontrado em {SCALER_PATH}", file=sys.stderr)
        return False
    if not os.path.exists(COLUMNS_PATH):
        print(f"❌ ERRO: Arquivo de colunas não encontrado em {COLUMNS_PATH}", file=sys.stderr)
        return False
    return True

def load_prediction_assets():
    """Carrega todos os 3 arquivos necessários para a predição."""
    if not check_model_files_exist():
        sys.exit(1)
        
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(COLUMNS_PATH, 'r') as f:
        feature_order = json.load(f)
        
    return model, scaler, feature_order

def preprocess_data(df, feature_order):
    """
    Prepara os dados de entrada para o modelo, aplicando get_dummies
    e reindexando para bater com as colunas do treino.
    """
    
    # 1. Aplica get_dummies nos dados de entrada
    # (drop_first=True, igual ao treino)
    df_encoded = pd.get_dummies(df, columns=['championName'], drop_first=True)
    
    # 2. Reindexa o DataFrame
    # Isso garante que:
    #  a) Todas as colunas que o modelo espera (feature_order) estejam presentes.
    #  b) Colunas (campeões) que estão na entrada, mas não no treino, sejam descartadas.
    #  c) Colunas (campeões) que estão no treino, mas não na entrada, sejam adicionadas com valor 0.
    df_reindexed = df_encoded.reindex(columns=feature_order, fill_value=0)
    
    return df_reindexed

def predict_batch(input_csv_path, output_json_path):
    """
    MODO BATCH (LoL): Lê um CSV, faz predição em todas as linhas
    e salva um JSON com os resultados.
    """
    print(f"--- Iniciando Predição em Batch (League of Legends) ---", file=sys.stderr)
    
    model, scaler, feature_order = load_prediction_assets()
    
    print(f"Carregando dados de entrada: {input_csv_path}", file=sys.stderr)
    try:
        input_df = pd.read_csv(input_csv_path)
    except FileNotFoundError:
        print(f"❌ ERRO: Arquivo de entrada não encontrado em {input_csv_path}", file=sys.stderr)
        return

    # --- PREPARAÇÃO DOS DADOS (LoL) ---
    print("Preparando features para o modelo (dummies e reindex)...", file=sys.stderr)
    
    try:
        # Passa o DataFrame para a nova função de pré-processamento
        input_df_processed = preprocess_data(input_df, feature_order)
    except Exception as e:
        print(f"❌ ERRO durante o pré-processamento: {e}", file=sys.stderr)
        print(f"   Colunas esperadas (início): {feature_order[:5]}...", file=sys.stderr)
        print(f"   Colunas encontradas no CSV: {list(input_df.columns)}", file=sys.stderr)
        return
        
    # Escala os dados (em batch)
    print("Aplicando scaler...", file=sys.stderr)
    input_scaled = scaler.transform(input_df_processed)
    
    # --- PREDIÇÃO (EM BATCH) ---
    print("Fazendo predições...", file=sys.stderr)
    predictions_codes = model.predict(input_scaled)
    predictions_probs = model.predict_proba(input_scaled)
    
    # --- FORMATANDO A SAÍDA ---
    print("Formatando resultados...", file=sys.stderr)
    results = []
    for i in range(len(predictions_codes)):
        prediction_text = "Vitória" if predictions_codes[i] == 1 else "Derrota"
        confidence = predictions_probs[i].max() * 100
        
        result = {
            "prediction": prediction_text,
            "confidence": f"{confidence:.2f}%"
        }
        results.append(result)
        
    # --- SALVANDO A SAÍDA ---
    print(f"Salvando {len(results)} predições em: {output_json_path}", file=sys.stderr)
    with open(output_json_path, 'w') as f:
        json.dump(results, f, indent=4)
        
    print("--- ✅ Predição em batch (LoL) concluída com sucesso! ---", file=sys.stderr)


def predict_single(data_dict):
    """
    MODO SINGLE (LoL): Recebe um dicionário (JSON) e imprime 
    a predição no console (para o Node.js).
    """
    model, scaler, feature_order = load_prediction_assets()
    
    try:
        input_df = pd.DataFrame([data_dict])
        input_df_processed = preprocess_data(input_df, feature_order)
    except Exception as e:
        print(json.dumps({"error": f"Erro no pré-processamento: {e}"}))
        sys.exit(1)
    
    input_scaled = scaler.transform(input_df_processed)
    
    prediction_code = model.predict(input_scaled)[0]
    prediction_text = "Vitória" if prediction_code == 1 else "Derrota"
    
    probabilities = model.predict_proba(input_scaled)[0]
    confidence = probabilities.max() * 100
    
    result = {
        "prediction": prediction_text,
        "confidence": f"{confidence:.2f}%"
    }
    # Imprime o JSON final para o Node.js capturar
    print(json.dumps(result))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Faz predições (LoL) em batch (CSV) ou predição única (JSON).")
    
    parser.add_argument('--input', type=str, help='Caminho para o arquivo CSV de entrada (batch).')
    parser.add_argument('--output', type=str, help='Caminho para o arquivo JSON de saída (batch).')
    parser.add_argument('--json_data', type=str, help='String JSON com os dados de entrada (single).')

    args = parser.parse_args()

    if args.input and args.output:
        predict_batch(args.input, args.output)
        
    elif args.json_data:
        try:
            input_data = json.loads(args.json_data)
            predict_single(input_data)
        except json.JSONDecodeError:
            print(json.dumps({"error": "O argumento --json_data não é um JSON válido."}))
            sys.exit(1)
            
    elif len(sys.argv) > 1 and sys.argv[1] not in ['--input', '--output', '--json_data', '-h', '--help']:
        print("Aviso: Executando em modo de compatibilidade (lendo JSON de sys.argv[1])...", file=sys.stderr)
        try:
            input_data = json.loads(sys.argv[1])
            predict_single(input_data)
        except json.JSONDecodeError:
            print(json.dumps({"error": f"Argumento '{sys.argv[1]}' não é um JSON válido."}))
            sys.exit(1)
    else:
        print("❌ ERRO: Argumentos inválidos.", file=sys.stderr)
        parser.print_help(file=sys.stderr)
        sys.exit(1)