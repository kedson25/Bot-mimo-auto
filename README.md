# WhatsApp Bot - Assistente de Vendas

Bot do WhatsApp com IA gratuita (MiMo Auto) e **Painel Web Visual** para criar fluxos de atendimento.

## Funcionalidades

- **🤖 IA Gratuita**: MiMo Auto da Xiaomi, sem necessidade de API key
- **🔀 Editor Visual**: Crie fluxos de atendimento arrastando blocos
- **📊 Dashboard**: Visao geral dos fluxos e metricas
- **⚙️ Configuracoes**: Altere nome, personalidade e comportamento do bot

## Instalacao

```bash
# Instalar dependencias do bot
npm install

# Instalar dependencias do painel
cd panel && npm install && cd ..
```

## Configurar Firebase (Opcional)

Para salvar fluxos na nuvem, coloque seu `firebase-service-account.json` na raiz do projeto.

Sem Firebase, o painel funciona em modo local (dados salvos em memoria).

## Executar

### Bot + Painel (Desenvolvimento)

```bash
# Terminal 1: Bot WhatsApp
npm start

# Terminal 2: Painel Web
npm run panel
```

### Acessar o Painel

Abra http://localhost:5173 no navegador.

### Producao

```bash
# Build do painel
npm run panel:build

# Iniciar com painel integrado
cd panel && npm start
```

Acesse http://localhost:3001

## Editor de Fluxos

O painel permite criar fluxos de atendimento visualmente:

### Tipos de Nos

| No | Descricao |
|----|-----------|
| ▶️ Inicio | Ponto de entrada do fluxo |
| 💬 Mensagem | Enviar mensagem de texto |
| 🖼️ Imagem | Enviar imagem com legenda |
| 🔘 Botoes | Menu de opcoes para o usuario |
| ❓ Condicao | Verificar resposta e ramificar |
| ⏳ Aguardar Input | Esperar resposta do usuario |
| 🌐 API | Chamar API externa |
| ⏱️ Espera | Aguardar tempo antes de continuar |
| 👤 Transferir | Transferir para atendente humano |
| ⏹️ Fim | Encerrar conversa |

### Como Criar um Fluxo

1. Clique em "+ Novo Fluxo"
2. Arraste nos da barra lateral para o canvas
3. Conecte os nos arrastando de um para outro
4. Configure cada no clicando nele
5. Salve com o botao "Salvar"

## Estrutura

```
whatsapp-bot/
├── index.js              # Bot WhatsApp principal
├── mimo.js               # Integracao MiMo Auto
├── flowExecutor.js       # Executor de fluxos
├── config.json           # Respostas pre-definidas
├── ai-config.json        # Configuracao da IA
├── firebase.js           # Conexao Firebase
├── panel/                # Painel Web
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Paginas do painel
│   │   └── utils/        # Funcoes utilitarias
│   ├── server/
│   │   └── index.js      # API Express
│   └── package.json
└── package.json
```

## Comandos do Bot

| Comando | Descricao |
|---------|-----------|
| `ajuda` / `menu` | Lista de opcoes |
| `/registre` | Criar conta |
| `/login` | Acessar conta |
| `/config` | Configuracoes (admin) |
| `limpar` | Limpar historico |
| `pesquise [assunto]` | Pesquisa detalhada |
| `calcule [expr]` | Calculadora |

## Tecnologias

- **Bot**: Node.js + whatsapp-web.js
- **IA**: MiMo Auto (gratuito)
- **Painel**: React + Vite + React Flow
- **API**: Express.js
- **Banco**: Firebase Firestore (opcional)
