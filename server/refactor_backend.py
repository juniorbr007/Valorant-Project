import os
import shutil
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent

# ======================
# 1. CREATE NEW BRANCH
# ======================
def create_branch():
    print("📌 Criando branch fix/backend-refactor...")
    try:
        subprocess.run(["git", "checkout", "-b", "fix/backend-refactor"], check=True)
        print("✔ Branch criada com sucesso!")
    except subprocess.CalledProcessError:
        print("⚠ Branch já existe — continuando...")


# ======================
# 2. CREATE FOLDER STRUCTURE
# ======================
def create_folders():
    folders = [
        "data/input",
        "data/processed",
        "data/literature",
        "models",
        "results/logs",
        "figures",
        "src/classifiers",
        "src/utils",
        "src/pipelines",
        "tests"
    ]

    for f in folders:
        path = ROOT / f
        path.mkdir(parents=True, exist_ok=True)
        print(f"📁 Criado: {path}")


# ======================
# 3. MOVE FILES TO NEW STRUCTURE
# ======================
def move_file(src, dst):
    src_path = ROOT / src
    dst_path = ROOT / dst

    if src_path.exists():
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src_path), str(dst_path))
        print(f"📦 Movido: {src_path} → {dst_path}")
    else:
        print(f"⚠ Arquivo não encontrado: {src_path}")


def move_files():
    mapping = {
        "lol_player_stats.csv": "data/input/dataset.csv",
        "ml_results.json": "results/ml_results.json",
        "train_models.py": "src/train_models.py",
        "train_and_save_model.py": "src/pipelines/train_and_save.py",
        "generate_all_plots.py": "src/pipelines/generate_all_plots.py",
        "feature_analysis.py": "src/utils/feature_analysis.py",
        "plot_utils.py": "src/utils/plot_utils.py",
        "model_utils.py": "src/model_utils.py",
        "model_evaluation.py": "src/evaluate.py",

        # Classifiers
        "random_forest_classifier.py": "src/classifiers/random_forest.py",
        "naive_bayes_classifier.py": "src/classifiers/naive_bayes.py",
        "knn_classifier.py": "src/classifiers/knn.py",
        "lr_classifier.py": "src/classifiers/logistic_regression.py",
    }

    for old, new in mapping.items():
        move_file(old, new)


# ======================
# 4. CREATE EMPTY __init__.py
# ======================
def create_init_files():
    for folder in ["src", "src/classifiers", "src/utils", "src/pipelines"]:
        init_file = ROOT / folder / "__init__.py"
        init_file.touch()
        print(f"🧱 Criado: {init_file}")


# ======================
# 5. GIT ADD CHANGES
# ======================
def git_add():
    print("📌 Aplicando git add...")
    subprocess.run(["git", "add", "."], check=False)
    print("✔ Alterações adicionadas!")


if __name__ == "__main__":
    print("\n🚀 INICIANDO REESTRUTURAÇÃO DO BACKEND...\n")
    create_branch()
    create_folders()
    move_files()
    create_init_files()
    git_add()
    print("\n🎉 FINALIZADO! Agora faça:\n")
    print("   git commit -m \"Refactor: reorganize backend structure\"\n")
    print("   git push --set-upstream origin fix/backend-refactor\n")
