class IndicadorResponse(BaseModel):
    id: int
    nome: str
    agrupador: str
    pontos_atual: float
    pontos_maximo: float
    meta_mensal: float
    meta_acumulada: float
    realizado_mensal: float
    realizado_acumulado: float
    meta_extra_porcentagem: float

    class Config:
        orm_mode = True
