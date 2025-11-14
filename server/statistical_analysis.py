# server/visualize_results.py

import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

plt.switch_backend("Agg")  # garante compatibilidade em servidores sem display


def plot_metric_bars(results, output_dir):
    """
    Gera um gráfico de barras com Accuracy, Precision, Recall e F1-score
    para cada modelo presente em ml_results.json.
    """

    os.makedirs(output_dir, exist_ok=True)

    model_names = []
    accuracies = []
    precisions = []
    recalls = []
    f1_scores = []

    for r in results:
        model_names.append(r["model_name"])
        accuracies.append(r["accuracy"])
        precisions.append(r["precision"])
        recalls.append(r["recall"])
        f1_scores.append(r["f1_score"])

    x = np.arange(len(model_names))
    width = 0.20

    fig, ax = plt.subplots(figsize=(12, 6))

    ax.bar(x - 1.5*width, accuracies, width, label='Accuracy')
    ax.bar(x - 0.5*width, precisions, width, label='Precision')
    ax.bar(x + 0.5*width, recalls, width, label='Recall')
    ax.bar(x + 1.5*width, f1_scores, width, label='F1-Score')

    ax.set_ylabel("Média das Métricas")
    ax.set_title("Comparação das Métricas Entre os Modelos")
    ax.set_xticks(x)
    ax.set_xticklabels(model_names, rotation=20)
    ax.legend()

    plt.tight_layout()
    file_path = os.path.join(output_dir, "metrics_comparison.png")
    plt.savefig(file_path, dpi=300, bbox_inches="tight")
    plt.close()

    print(f" Gráfico de comparação salvo em: {file_path}")


def plot_accuracy_heatmap(results, output_dir):
    """
    Gera um heatmap com a acurácia média de cada modelo.
    """
    os.makedirs(output_dir, exist_ok=True)

    model_names = [r["model_name"] for r in results]
    accuracies = [r["accuracy"] for r in results]

    heatmap_data = np.array([accuracies])

    fig, ax = plt.subplots(figsize=(10, 2))

    sns.heatmap(
        heatmap_data,
        annot=True,
        fmt=".3f",
        cmap="crest",
        xticklabels=model_names,
        yticklabels=["Accuracy"],
        cbar=False,
        linewidths=0.5,
        linecolor="gray"
    )

    plt.title("Heatmap de Acurácia Média dos Modelos")
    plt.tight_layout()

    file_path = os.path.join(output_dir, "accuracy_heatmap.png")
    plt.savefig(file_path, dpi=300, bbox_inches="tight")
    plt.close()

    print(f" Heatmap salvo em: {file_path}")


def main():
    """
    Lê 'ml_results.json' e gera gráficos comparativos.
    """
    results_file = "ml_results.json"

    if not os.path.exists(results_file):
        print(" Erro: Arquivo 'ml_results.json' não encontrado.")
        print("Execute o pipeline de ML primeiro.")
        return

    try:
        with open(results_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(" Erro ao decodificar ml_results.json.")
        return

    results = data.get("results", [])
    if not results:
        print("⚠️ Nenhum resultado encontrado no arquivo.")
        return

    output_dir = "confusion_matrices"

    print("Gerando gráficos de métricas e comparações...")

    plot_metric_bars(results, output_dir)
    plot_accuracy_heatmap(results, output_dir)

    print("\n Todos os gráficos foram gerados com sucesso!")
    print(f"Arquivos salvos em: {os.path.abspath(output_dir)}")


if __name__ == "__main__":
    main()
