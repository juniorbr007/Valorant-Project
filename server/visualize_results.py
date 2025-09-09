import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def plot_confusion_matrix(cm, model_name, class_names=['Derrota', 'Vitória']):
    """
    Cria e salva um heatmap de uma matriz de confusão.
    """
    # Cria a figura e os eixos
    fig, ax = plt.subplots(figsize=(8, 6))
    
    # Usa o seaborn para criar o heatmap
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax, 
                xticklabels=class_names, yticklabels=class_names)
    
    # Adiciona títulos e rótulos
    ax.set_title(f'Matriz de Confusão - {model_name}', fontsize=16)
    ax.set_ylabel('Valor Real', fontsize=12)
    ax.set_xlabel('Predição do Modelo', fontsize=12)
    
    # Garante que o layout fique bom
    plt.tight_layout()
    
    # Salva a figura como uma imagem .png
    output_filename = f"confusion_matrix_{model_name.replace(' ', '_')}.png"
    plt.savefig(output_filename)
    print(f"-> Gráfico salvo como: {output_filename}")
    # plt.show() # Descomente esta linha se quiser ver o gráfico aparecer na tela

def main():
    """
    Função principal: lê os resultados do modelo e gera as visualizações.
    """
    try:
        # Abre o arquivo com os resultados que nosso outro script gerou
        with open('ml_results.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Erro: Arquivo 'ml_results.json' não encontrado.")
        print("Execute a pipeline de treinamento no dashboard primeiro.")
        return

    results = data.get('results', [])
    if not results:
        print("Nenhum resultado de modelo encontrado no arquivo.")
        return

    print("Gerando gráficos de Matriz de Confusão...")
    for result in results:
        model_name = result.get('model_name')
        cm_data = np.array(result.get('confusion_matrix'))
        
        if model_name and cm_data.shape == (2, 2):
            plot_confusion_matrix(cm_data, model_name)
        else:
            print(f"Dados inválidos para o modelo {model_name}. Pulando.")

if __name__ == "__main__":
    main()