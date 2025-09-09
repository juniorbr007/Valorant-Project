import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import json
import sys

plt.switch_backend('Agg')

def analyze_features(csv_path='lol_player_stats.csv'):
    """
    Carrega o dataset de um jogador, treina um modelo Random Forest
    e gera um gráfico com a importância de cada feature.
    """
    try:
        df = pd.read_csv(csv_path)
        if df.shape[0] < 10:
            return {"error": "Dataset muito pequeno para uma análise significativa (mínimo de 10 partidas)."}
    except FileNotFoundError:
        return {"error": f"Arquivo '{csv_path}' não encontrado. Gere o dataset primeiro."}

    # --- AJUSTE CRÍTICO AQUI ---
    # Adicionamos 'gameMode' à lista de colunas para serem transformadas em dummies.
    # Agora, tanto os nomes dos campeões quanto os modos de jogo viram números.
    df_encoded = pd.get_dummies(df, columns=['championName', 'gameMode'], drop_first=True)

    # Separação em Features (X) e Alvo (y)
    X = df_encoded.drop('win', axis=1)
    y = df_encoded['win']
    
    # Treina o modelo Random Forest com todos os dados do jogador
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Extrai a importância das features
    importances = model.feature_importances_
    feature_names = X.columns
    
    # Cria um DataFrame para facilitar a visualização e ordenação
    feature_importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values(by='importance', ascending=False)

    # Criação do Gráfico
    plt.figure(figsize=(12, 8))
    sns.barplot(x='importance', y='feature', data=feature_importance_df.head(15), palette='viridis_r', hue='feature', legend=False)
    plt.title('Top 15 Features Mais Importantes para Prever a Vitória', fontsize=16)
    plt.xlabel('Importância Relativa (Gini Importance)', fontsize=12)
    plt.ylabel('Feature', fontsize=12)
    plt.tight_layout()
    
    output_image_path = "feature_importance.png"
    plt.savefig(output_image_path)
    
    # Retorna o caminho da imagem que foi gerada
    return {"image_path": output_image_path}


if __name__ == "__main__":
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'lol_player_stats.csv'
    result = analyze_features(csv_file)
    print(json.dumps(result))