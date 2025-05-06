from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from fastapi import HTTPException
from pydantic import BaseModel
from datetime import date

app = FastAPI()

# CORS para o frontend
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar tabelas no SQLite
models.Base.metadata.create_all(bind=engine)


# Endpoint simples
@app.get("/")
def root():
    return {"mensagem": "API de indicadores funcionando"}

# Endpoint para listar indicadores com seus dados
@app.get("/indicadores")
def listar_indicadores(db: Session = Depends(get_db)):
    indicadores = db.query(models.Indicador).all()
    return [
        {
            "id": i.id,
            "nome": i.nome,
            "agrupador": i.agrupador.nome if i.agrupador else None,
            "pontos_atual": i.pontos_atual,
            "pontos_maximo": i.pontos_maximo,
            "meta_mensal": i.meta_mensal,
            "meta_acumulada": i.meta_acumulada,
            "realizado_mensal": i.realizado_mensal,
            "realizado_acumulado": i.realizado_acumulado
        }
        for i in indicadores
    ]
class IndicadorUpdate(BaseModel):
    realizado_mensal: float
    realizado_acumulado: float

@app.put("/indicadores/{indicador_id}")
def atualizar_indicador(indicador_id: int, dados: IndicadorUpdate, db: Session = Depends(get_db)):
    indicador = db.query(models.Indicador).filter(models.Indicador.id == indicador_id).first()
    if not indicador:
        raise HTTPException(status_code=404, detail="Indicador não encontrado")

    indicador.realizado_mensal = dados.realizado_mensal
    indicador.realizado_acumulado = dados.realizado_acumulado

    db.commit()
    db.refresh(indicador)
    return {"mensagem": "Indicador atualizado com sucesso"} 


class IndicadorCreate(BaseModel):
    nome: str
    agrupador: str
    meta_mensal: float
    meta_acumulada: float
    realizado_mensal: float
    realizado_acumulado: float

@app.post("/indicadores")
def criar_indicador(dados: IndicadorCreate, db: Session = Depends(get_db)):
    agrupador = db.query(models.Agrupador).filter_by(nome=dados.agrupador).first()
    if not agrupador:
        agrupador = models.Agrupador(nome=dados.agrupador)
        db.add(agrupador)
        db.commit()
        db.refresh(agrupador)

    novo = models.Indicador(
        nome=dados.nome,
        agrupador_id=agrupador.id,
        meta_mensal=dados.meta_mensal,
        meta_acumulada=dados.meta_acumulada,
        realizado_mensal=dados.realizado_mensal,
        realizado_acumulado=dados.realizado_acumulado,
        pontos_atual=0,
        pontos_maximo=100,
        peso=1.0
    )
    db.add(novo)
    db.commit()
    return {"mensagem": "Indicador criado com sucesso"}

@app.get("/agrupadores")
def listar_agrupadores(db: Session = Depends(get_db)):
    agrupadores = db.query(models.Agrupador).all()
    return [g.nome for g in agrupadores]

@app.delete("/indicadores/{indicador_id}")
def deletar_indicador(indicador_id: int, db: Session = Depends(get_db)):
    indicador = db.query(models.Indicador).filter(models.Indicador.id == indicador_id).first()
    if not indicador:
        raise HTTPException(status_code=404, detail="Indicador não encontrado")

    db.delete(indicador)
    db.commit()
    return {"mensagem": "Indicador deletado com sucesso"}

class HistoricoInput(BaseModel):
    valor: float
    data: date = date.today()

@app.post("/historico/{indicador_id}")
def adicionar_historico(indicador_id: int, entrada: HistoricoInput, db: Session = Depends(get_db)):
    indicador = db.query(models.Indicador).filter(models.Indicador.id == indicador_id).first()
    if not indicador:
        raise HTTPException(status_code=404, detail="Indicador não encontrado")

    # Adiciona histórico
    novo_historico = models.HistoricoDiario(
        indicador_id=indicador_id,
        data=entrada.data,
        valor=entrada.valor
    )
    db.add(novo_historico)

    # Atualiza os valores no indicador
    indicador.realizado_mensal += entrada.valor
    indicador.realizado_acumulado += entrada.valor

    db.commit()
    return {"mensagem": "Histórico adicionado e indicador atualizado"}