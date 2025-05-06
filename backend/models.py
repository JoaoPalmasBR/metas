from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Agrupador(Base):
    __tablename__ = "agrupadores"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)

class Indicador(Base):
    __tablename__ = "indicadores"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    agrupador_id = Column(Integer, ForeignKey("agrupadores.id"))
    pontos_atual = Column(Float, default=0)
    pontos_maximo = Column(Float)
    peso = Column(Float)
    meta_mensal = Column(Float)
    meta_acumulada = Column(Float)
    realizado_mensal = Column(Float)
    realizado_acumulado = Column(Float)
    agrupador = relationship("Agrupador")

class HistoricoDiario(Base):
    __tablename__ = "historico_diario"
    id = Column(Integer, primary_key=True, index=True)
    indicador_id = Column(Integer, ForeignKey("indicadores.id"))
    data = Column(Date)
    valor = Column(Float)
    indicador = relationship("Indicador")