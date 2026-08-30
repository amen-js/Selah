# Selah

Jogo bíblico 3D para a web.

Selah é um projeto de jogo interativo em 3D no navegador, inspirado em narrativas e atmosfera bíblica. O repositório concentra o código e o planejamento do produto.

## Setup

```bash
npm install
cp .env.example .env   # preencha OPENROUTER_API_KEY e, se houver, YVP_APP_KEY
npm run dev            # Vite 0.0.0.0:5173 + proxy Hono :8787
```

Endpoints do Dev 2 (testáveis com `curl`, sem 3D):

- `GET /api/versiculo?passagemId=genesis-1-3&idioma=pt-BR`
- `POST /api/quiz/gerar`
- `POST /api/quiz/responder`
- `POST /api/metricas/eventos`

Sem chaves, o proxy usa o snapshot local de domínio público e os quizzes aprovados em `server/data/`.


## Plano

O plano de produto e execução do hackathon está em [`plans/selah.plan.md`](plans/selah.plan.md).

O documento de design do jogo está em [`docs/GDD.md`](docs/GDD.md).

## Equipe

| Papel | Nome | GitHub |
| --- | --- | --- |
| Dev 1 | Pedro | [pedromlabio](https://github.com/pedromlabio) |
| Dev 2 | Will | [willian-ishida](https://github.com/willian-ishida) |
| Dev 3 | Mário | [marionantes](https://github.com/marionantes) |
| Design | Matheus | [MatheusGomes-ctrl](https://github.com/MatheusGomes-ctrl) |
| P.O. | Lilian | [lilianjanniffer](https://github.com/lilianjanniffer) |

## Licença

Privado — organização [amen-js](https://github.com/amen-js).
