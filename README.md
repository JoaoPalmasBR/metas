# Metas

## Backend

na pasta `backend/`:

rodar:

```bash
cd backend
```

```bash
python -m venv venv
```

no linux:

```bash
source venv/bin/activate
```

no windows:

```bash
.\venv\Scripts\activate
```

```bash
pip install -r requirements.txt
```

```bash
uvicorn main:app --reload
```

Rodando
| Etapa | Ação |
| --- | ---|
| Verificar status da API | [http://localhost:8000](http://localhost:8000) |
| Documentação da API | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Ver os dados diretamente | [http://localhost:8000/indicadores](http://localhost:8000/indicadores) |

```json
{
  "mensagem": "API de indicadores funcionando"
}
```

## Frontend

```bash
cd frontend
```

```bash
npm install
```

```bash
npm start
```

Rode o app no modo de desenvolvimento.

Abrir [http://localhost:3000](http://localhost:3000)

The page will reload if you make edits.\
You will also see any lint errors in the console.
