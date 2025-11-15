# server/analysis/generate_all_plots.py

import os
from cv_bloxplot import main as cv_boxplot_main
from ranking_plot import main as ranking_plot_main
from roc_curves import main as roc_curves_main
from nemenyi_plot_manual import main as nemenyi_plot_main

FIGURES_PATH = "analysis_results/"
os.makedirs(FIGURES_PATH, exist_ok=True)

def main():
    print("="*40)
    print("Gerando todos os gráficos de análise")
    print("="*40)

    # 1️⃣ CV Boxplot
    print("\n1️⃣ Gerando CV Boxplot...")
    try:
        cv_boxplot_main()
    except Exception as e:
        print(f"❌ Erro no CV Boxplot: {e}")

    # 2️⃣ Ranking
    print("\n2️⃣ Gerando Ranking Plot...")
    try:
        ranking_plot_main()
    except Exception as e:
        print(f"❌ Erro no Ranking Plot: {e}")

    # 3️⃣ ROC Curves
    print("\n3️⃣ Gerando ROC Curves...")
    try:
        roc_curves_main()
    except Exception as e:
        print(f"❌ Erro no ROC Curves: {e}")

    # 4️⃣ Nemenyi Manual
    print("\n4️⃣ Gerando Nemenyi Plot (Manual)...")
    try:
        nemenyi_plot_main()
    except Exception as e:
        print(f"❌ Erro no Nemenyi Plot: {e}")

    print("\n🎉 Todos os gráficos gerados (se não houver erros).")

if __name__ == "__main__":
    main()
