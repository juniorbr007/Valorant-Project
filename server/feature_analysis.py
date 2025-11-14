# server/feature_analysis.py

import sys
import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier

plt.switch_backend("Agg")  # garante compatibilidade em ambientes sem interface gráfica


def analyze_features(csv_path='lol_player_stats.csv', output_dir='feature_analysis'):
    """
    Realiza análise de importância das features usando Random Forest.
    """

    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        msg = f"❌ Erro ao carregar CSV: {e}"
        print(msg, file=sys.stderr)
        return {"error": msg}

    if df.shape[0] < 10:
        msg = "⚠️ Dataset muito pequeno (mínimo 10 partidas)."
        print(msg, file=sys.stderr)
        return {"error": msg}

    os.makedirs(output_dir, exist_ok=True)

    if "win" not in df.columns:
        msg = "❌ Dataset sem coluna 'win'."
        print(msg, file=sys.stderr)
        return {"error": msg}

    # One-hot para categóricas
    categorical_cols = [c for c in ['championName', 'gameMode'] if c in df.columns]
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    X = df_encoded.drop(columns=['win'], errors='ignore')
    y = df_encoded['win']

    X = X.select_dtypes(include=['int64', 'float64'])

    # Random Forest
    try:
        model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
        model.fit(X, y)
    except Exception as e:
        msg = f"❌ Erro ao treinar modelo: {e}"
        print(msg, file=sys.stderr)
        return {"error": msg}

    # Importâncias
    importances = model.feature_importances_
    feature_importance_df = (
        pd.DataFrame({"feature": X.columns, "importance": importances})
        .sort_values(by="importance", ascending=False)
    )

    # ---------- GRÁFICO CORRIGIDO ----------
    plt.figure(figsize=(10, 7))

    sns.barplot(
        data=feature_importance_df.head(15),
        x="importance",
        y="feature",
        palette="viridis_r"
    )

    plt.title("Top 15 Features Mais Relevantes para Vitória", fontsize=14, pad=12)
    plt.xlabel("Importância Relativa (Gini Importance)", fontsize=12)
    plt.ylabel("Feature", fontsize=12)
    plt.grid(axis="x", linestyle="--", alpha=0.4)
    plt.tight_layout()

    # Arquivos de saída
    image_path = os.path.join(output_dir, "feature_importance.png")
    csv_path_out = os.path.join(output_dir, "feature_importance.csv")

    # SALVA DE VERDADE
    plt.savefig(image_path, dpi=300, bbox_inches="tight")
    plt.close()

    # Salva CSV
    feature_importance_df.to_csv(csv_path_out, index=False)

    print(f"✅ Análise concluída e salva em:\n- {image_path}\n- {csv_path_out}", file=sys.stderr)

    return {"image_path": image_path, "csv_path": csv_path_out}


if __name__ == "__main__":
    file = sys.argv[1] if len(sys.argv) > 1 else "lol_player_stats.csv"
    result = analyze_features(file)
    print(json.dumps(result, indent=4))
