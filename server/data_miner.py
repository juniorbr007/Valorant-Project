import sys
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
        print("Conectado ao MongoDB com sucesso!", file=sys.stderr)
        return db["lol_raw_matches"] 
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}", file=sys.stderr)
        return None

def main():
    """Função principal do script."""
    
    # --- MUDANÇA 1: Recebe o PUUID como argumento ---
    # O script agora espera receber o PUUID do jogador que queremos analisar.
    if len(sys.argv) < 2:
        print("Erro: PUUID do jogador nao foi fornecido.", file=sys.stderr)
        return
    
    target_puuid = sys.argv[1]
    print(f"Iniciando mineracao de dados para o PUUID: {target_puuid}", file=sys.stderr)

    matches_collection = connect_to_db()
    if matches_collection is None:
        return

    # --- MUDANÇA 2: Busca apenas partidas do jogador específico ---
    print(f"Buscando partidas do jogador na colecao '{matches_collection.name}'...", file=sys.stderr)
    # A query agora filtra os documentos para encontrar apenas aqueles que contêm o PUUID do nosso jogador.
    all_matches_cursor = matches_collection.find({ "info.participants.puuid": target_puuid })
    all_matches_list = list(all_matches_cursor)

    if not all_matches_list:
        print(f"Nenhuma partida encontrada para o jogador com PUUID {target_puuid}.", file=sys.stderr)
        # Cria um CSV vazio para não quebrar o script de ML
        pd.DataFrame([]).to_csv("lol_player_stats.csv", index=False)
        return
        
    print(f"Encontradas {len(all_matches_list)} partidas para o jogador. Processando...", file=sys.stderr)
    
    player_specific_data = []

    # --- MUDANÇA 3: Extrai dados apenas do jogador de interesse ---
    for match in all_matches_list:
        if 'info' not in match or 'participants' not in match['info']:
            continue
            
        for p in match['info']['participants']:
            # Apenas extrai os dados se o PUUID bater com o nosso alvo
            if p.get('puuid') == target_puuid:
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
                player_specific_data.append(player_data)
                break # Encontrou o jogador, pode pular para a próxima partida

    if not player_specific_data:
        print("Nenhum dado extraido para este jogador.", file=sys.stderr)
        return
        
    df = pd.DataFrame(player_specific_data)
    output_filename = "lol_player_stats.csv"
    df.to_csv(output_filename, index=False)
    
    print("\n" + "="*50, file=sys.stderr)
    print(f"--- MINERACAO CONCLUIDA PARA O JOGADOR ---", file=sys.stderr)
    print(f"Total de partidas processadas: {len(df)}", file=sys.stderr)
    print(f"Arquivo de saida gerado: {output_filename}", file=sys.stderr)
    print("="*50, file=sys.stderr)


if __name__ == "__main__":
    main()