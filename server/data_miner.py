import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd

# Carrega as variáveis de ambiente (MONGODB_URI) do arquivo .env
load_dotenv()

def connect_to_db():
    """Conecta ao MongoDB Atlas e retorna a coleção de partidas."""
    try:
        uri = os.getenv("MONGODB_URI")
        client = MongoClient(uri)
        db = client.get_default_database() 
        print("✅ Conectado ao MongoDB com sucesso!")
        return db["lol_raw_matches"] 
    except Exception as e:
        print(f"❌ Erro ao conectar ao MongoDB: {e}")
        return None

def extract_features_from_match(match_json):
    """
    Recebe o JSON completo de uma partida e extrai as features
    desejadas de cada um dos 10 participantes.
    """
    if not match_json or 'info' not in match_json or 'participants' not in match_json['info']:
        return []

    player_stats_list = []
    participants = match_json['info']['participants']

    for p in participants:
        player_data = {
            'win': 1 if p.get('win') else 0,
            'championName': p.get('championName'),
            'kills': p.get('kills'),
            'deaths': p.get('deaths'),
            'assists': p.get('assists'),
            'goldEarned': p.get('goldEarned'),
            'totalMinionsKilled': p.get('totalMinionsKilled'),
            'visionScore': p.get('visionScore'),
            'wardsPlaced': p.get('wardsPlaced'),
            'totalDamageDealtToChampions': p.get('totalDamageDealtToChampions'),
            'turretTakedowns': p.get('turretTakedowns'),
        }
        player_stats_list.append(player_data)
        
    return player_stats_list

def main():
    """Função principal do script."""
    matches_collection = connect_to_db()
    
    if matches_collection is None:
        return

    print(f"\nBuscando todas as partidas na coleção '{matches_collection.name}'...")
    
    # Busca TODAS as partidas salvas no banco de dados
    all_matches_cursor = matches_collection.find({})
    all_matches_list = list(all_matches_cursor)

    if not all_matches_list:
        print("⚠️ Nenhuma partida encontrada no banco de dados para processar.")
        return
        
    print(f"Encontradas {len(all_matches_list)} partidas. Processando...")

    # Lista para armazenar os dados de todos os jogadores de todas as partidas
    all_players_data = []

    for match in all_matches_list:
        extracted_data = extract_features_from_match(match)
        all_players_data.extend(extracted_data)

    if not all_players_data:
        print("Nenhum dado de jogador foi extraído.")
        return
        
    # Converte a lista completa de dados em um DataFrame do Pandas
    df = pd.DataFrame(all_players_data)
    
    # Salva o DataFrame em um arquivo CSV
    output_filename = "lol_player_stats.csv"
    df.to_csv(output_filename, index=False)
    
    print("\n" + "="*50)
    print("--- ✨ MINERAÇÃO DE DADOS CONCLUÍDA ✨ ---")
    print(f"Total de jogadores processados: {len(df)}")
    print(f"Arquivo de saída gerado: {output_filename}")
    print("="*50)
    print("\nAmostra dos dados:")
    print(df.head().to_string()) # .head() mostra as primeiras 5 linhas


if __name__ == "__main__":
    main()
