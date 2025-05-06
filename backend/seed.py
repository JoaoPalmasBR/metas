from database import SessionLocal
import models

db = SessionLocal()

# Criar agrupadores
grupos = ["Mobilizadores", "Créditos", "Serviços", "Investimentos"]
for nome in grupos:
    if not db.query(models.Agrupador).filter_by(nome=nome).first():
        db.add(models.Agrupador(nome=nome))
db.commit()

# Recuperar agrupadores criados
agrupadores = {g.nome: g.id for g in db.query(models.Agrupador).all()}

# Adicionar indicadores de exemplo
indicadores_exemplo = [
    {
        "nome": "Desembolso Consignado",
        "agrupador_id": agrupadores["Créditos"],
        "pontos_atual": 3.89,
        "pontos_maximo": 41.67,
        "peso": 5.56,
        "meta_mensal": 473433.31,
        "meta_acumulada": 2281066.94,
        "realizado_mensal": 34470.92,
        "realizado_acumulado": 2089283.70
    },
    {
        "nome": "Consórcio",
        "agrupador_id": agrupadores["Serviços"],
        "pontos_atual": 41.67,
        "pontos_maximo": 41.67,
        "peso": 2.78,
        "meta_mensal": 6589.74,
        "meta_acumulada": 32767.67,
        "realizado_mensal": 49202.97,
        "realizado_acumulado": 101968.87
    }
]

for indicador in indicadores_exemplo:
    db.add(models.Indicador(**indicador))

db.commit()
db.close()
