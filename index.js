const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { queryMimo, limparHistorico } = require('./mimo');
const { db } = require('./firebase');
const { handleFlowMessage, resetUserFlow } = require('./flowExecutor');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const aiConfig = JSON.parse(fs.readFileSync('./ai-config.json', 'utf8'));

const LISTS_DIR = path.join(__dirname, 'lists');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

if (!fs.existsSync(LISTS_DIR)) {
    fs.mkdirSync(LISTS_DIR, { recursive: true });
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let userContext = {};
let loggedUsers = {};

function loadSessions() {
    try {
        if (fs.existsSync(SESSIONS_FILE)) {
            const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
            loggedUsers = JSON.parse(data);
            console.log(`📋 ${Object.keys(loggedUsers).length} sessões carregadas`);
        }
    } catch (e) {
        console.error('Erro ao carregar sessões:', e.message);
        loggedUsers = {};
    }
}

function saveSessions() {
    try {
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(loggedUsers, null, 2));
    } catch (e) {
        console.error('Erro ao salvar sessões:', e.message);
    }
}

loadSessions();

async function checkUserExists(phone) {
    const usersRef = db.collection('bot');
    const snapshot = await usersRef.where('phone', '==', phone).get();
    return !snapshot.empty;
}

async function getUserData(phone) {
    const usersRef = db.collection('bot');
    const snapshot = await usersRef.where('phone', '==', phone).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function saveUser(phone, name, password, isAdmin = false) {
    const usersRef = db.collection('bot');
    await usersRef.add({
        phone,
        name,
        password,
        isAdmin,
        createdAt: new Date().toISOString()
    });
}

function saveList(userId, content) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lista_${userId.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.txt`;
    const filepath = path.join(LISTS_DIR, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    return filepath;
}

function getRecentLists(userId) {
    const files = fs.readdirSync(LISTS_DIR)
        .filter(f => f.includes(userId.replace(/[^a-zA-Z0-9]/g, '_')))
        .sort()
        .reverse()
        .slice(0, 5);

    if (files.length === 0) return null;

    let result = '📝 *Suas listas recentes:*\n\n';
    for (const file of files) {
        const content = fs.readFileSync(path.join(LISTS_DIR, file), 'utf8');
        const date = file.split('_').pop().replace('.txt', '').replace(/-/g, '/');
        result += `📅 ${date}\n${content.substring(0, 100)}...\n\n`;
    }
    return result;
}

async function handleCommand(texto, msg, senderId, userName) {
    const text = texto.toLowerCase().trim();

    if (text === 'ajuda' || text === 'menu' || text === 'help') {
        const menu = `
📋 *MENU PRINCIPAL*

🔹 /registre - Criar conta
🔹 /login - Acessar conta
🔹 /logout - Sair da conta
🔹 /config - Ver configurações (admin)
🔹 /status - Ver status do bot

📝 *Comandos úteis:*
• pesquise [assunto] - Pesquisar
• explique [tema] - Explicar algo
• como [ação] - Passo a passo
• calcule [expressão] - Calculadora
• crie lista [itens] - Salvar lista
• limpar - Limpar histórico
• hora - Ver hora atual
• data - Ver data atual
        `;
        return { type: 'reply', content: menu };
    }

    if (text === '/registre') {
        userContext[senderId] = { step: 'registre_name', data: {} };
        return { type: 'reply', content: '📝 *Cadastro*\n\nQual é o seu *nome*?' };
    }

    if (userContext[senderId]?.step === 'registre_name') {
        userContext[senderId].data.name = msg.body;
        userContext[senderId].step = 'registre_password';
        return { type: 'reply', content: `Olá *${msg.body}*! 👋\n\nAgora crie uma *senha* (mínimo 4 caracteres):` };
    }

    if (userContext[senderId]?.step === 'registre_password') {
        if (msg.body.length < 4) {
            return { type: 'reply', content: '❌ Senha muito curta! Use pelo menos *4 caracteres*.' };
        }
        const exists = await checkUserExists(senderId);
        if (exists) {
            userContext[senderId] = { step: 'idle', data: {} };
            return { type: 'reply', content: '⚠️ Você já possui uma conta! Use */login* para acessar.' };
        }
        await saveUser(senderId, userContext[senderId].data.name, msg.body, false);
        userContext[senderId] = { step: 'idle', data: {} };
        return { type: 'reply', content: `✅ *Conta criada com sucesso!*\n\n👤 Nome: ${userContext[senderId].data.name}\n📱 Phone: ${senderId}\n\nUse */login* para acessar.` };
    }

    if (text === '/login') {
        const user = await getUserData(senderId);
        if (!user) {
            return { type: 'reply', content: '⚠️ Conta não encontrada! Use */registre* para criar uma.' };
        }
        userContext[senderId] = { step: 'login_password', data: { user } };
        return { type: 'reply', content: '🔐 *Login*\n\nDigite sua *senha*:' };
    }

    if (userContext[senderId]?.step === 'login_password') {
        const { user } = userContext[senderId].data;
        if (msg.body !== user.password) {
            return { type: 'reply', content: '❌ *Senha incorreta!* Tente novamente.' };
        }
        loggedUsers[senderId] = user;
        saveSessions();
        userContext[senderId] = { step: 'idle', data: {} };
        const adminText = user.isAdmin ? '\n👑 *Status: Administrador*' : '';
        return { type: 'reply', content: `✅ *Login realizado!*\n\n👤 Bem-vindo, *${user.name}*!${adminText}\n\nUse */config* para acessar as configurações.` };
    }

    if (text === '/logout') {
        delete loggedUsers[senderId];
        saveSessions();
        return { type: 'reply', content: '👋 *Logout realizado!* Até mais!' };
    }

    if (text === '/config') {
        if (!loggedUsers[senderId]) {
            return { type: 'reply', content: '⚠️ Faça */login* primeiro para acessar as configurações.' };
        }
        if (!loggedUsers[senderId].isAdmin) {
            return { type: 'reply', content: '🔒 *Acesso negado!* Apenas administradores podem acessar as configurações.' };
        }
        const configMenu = `
⚙️ *CONFIGURAÇÕES DO BOT*

Comportamento e Personalidade:

1️⃣ */config nome [novo nome]* - Alterar nome do bot
2️⃣ */config personalidade [descrição]* - Mudar personalidade
3️⃣ */config idioma [pt/es/en]* - Alterar idioma
4️⃣ */config criativo [on/off]* - Modo criativo
5️⃣ */config humor [alegre/sério/educado]* - Tom de voz
6️⃣ */config ver* - Ver configuração atual
        `;
        return { type: 'reply', content: configMenu };
    }

    if (text.startsWith('/config ')) {
        if (!loggedUsers[senderId]) {
            return { type: 'reply', content: '⚠️ Faça */login* primeiro.' };
        }
        if (!loggedUsers[senderId].isAdmin) {
            return { type: 'reply', content: '🔒 *Acesso negado!*' };
        }

        const args = msg.body.replace('/config ', '').split(' ');
        const action = args[0].toLowerCase();
        const value = args.slice(1).join(' ');

        if (action === 'nome' && value) {
            aiConfig.systemPrompt = aiConfig.systemPrompt.replace(/Seu nome é \w+ Bot/, `Seu nome é ${value}`);
            fs.writeFileSync('./ai-config.json', JSON.stringify(aiConfig, null, 4));
            return { type: 'reply', content: `✅ Nome alterado para *${value}*!` };
        }

        if (action === 'personalidade' && value) {
            return { type: 'reply', content: `✅ Personalidade definida: *${value}*` };
        }

        if (action === 'idioma' && value) {
            const idiomas = { pt: 'português brasileiro', es: 'espanhol', en: 'inglês' };
            return { type: 'reply', content: `✅ Idioma alterado para *${idiomas[value] || value}*!` };
        }

        if (action === 'criativo') {
            const mode = value === 'on' ? 'ativado' : 'desativado';
            return { type: 'reply', content: `✅ Modo criativo *${mode}*!` };
        }

        if (action === 'humor' && value) {
            return { type: 'reply', content: `✅ Tom de voz definido: *${value}*` };
        }

        if (action === 'ver') {
            return { type: 'reply', content: `⚙️ *Configuração Atual:*\n\nNome: Eco Bot\nIdioma: Português\nModo: Padrão` };
        }

        return { type: 'reply', content: '❌ Comando inválido. Use */config* para ver as opções.' };
    }

    if (text === '/status') {
        return { type: 'reply', content: `🤖 *Eco Bot Status*\n\n✅ Online\n📅 Versão: 4.0.0\n⚙️ Modo: Assistente Completo` };
    }

    if (text === 'inicio' || text === 'início' || text === '/inicio') {
        resetUserFlow(senderId);
        return { type: 'reply', content: '🔄 *Fluxo reiniciado!* Como posso ajudar?' };
    }

    if (text === 'limpar' || text === 'clear') {
        limparHistorico(senderId);
        return { type: 'reply', content: config.commands['limpar'] };
    }

    if (text === 'hora' || text === 'horas') {
        const now = new Date();
        return { type: 'reply', content: `🕐 *Hora atual:* ${now.toLocaleTimeString('pt-BR')}` };
    }

    if (text === 'data' || text === 'hoje') {
        const now = new Date();
        return { type: 'reply', content: `📅 *Data atual:* ${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` };
    }

    const calcMatch = text.match(/^calcule\s+(.+)/);
    if (calcMatch) {
        try {
            const expr = calcMatch[1].replace(/[^0-9+\-*/().]/g, '');
            const result = eval(expr);
            return { type: 'reply', content: `🧮 *Resultado:* ${result}` };
        } catch (e) {
            return { type: 'reply', content: '❌ Não consegui calcular essa expressão.' };
        }
    }

    const listMatch = text.match(/^(?:crie|salve|nova|adicione)\s+(?:lista|item|itens?)\s*(?:de\s+)?(.+)/);
    if (listMatch) {
        const content = listMatch[1];
        const items = content.split(/[,;]/).map(i => `• ${i.trim()}`).join('\n');
        saveList(senderId, items);
        return { type: 'reply', content: `✅ *Lista salva!*\n\n${items}\n\n📁 Arquivo criado em lists/` };
    }

    if (text === 'lista' || text === 'listas' || text === 'minhas listas') {
        const lists = getRecentLists(senderId);
        return { type: 'reply', content: lists || '📝 Nenhuma lista encontrada. Crie uma com: *Crie lista [itens]' };
    }

    return null;
}

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot do WhatsApp conectado!');
    console.log('🤖 Modo: Eco Bot (assistente completo)');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const userName = contact.pushname || 'usuário';
    const texto = msg.body.toLowerCase().trim();
    const senderId = msg.from;

    console.log(`📩 ${userName}: ${msg.body}`);

    if (!userContext[senderId]) {
        userContext[senderId] = { step: 'idle', data: {}, messages: [] };
    }

    const commandResult = await handleCommand(msg.body, msg, senderId, userName);
    if (commandResult) {
        await msg.reply(commandResult.content);
        console.log(`📤 Bot (comando): ${commandResult.content.substring(0, 50)}...`);
        return;
    }

    const flowHandled = await handleFlowMessage(
        senderId,
        msg.body,
        (text) => msg.reply(text)
    );
    if (flowHandled) {
        console.log(`📤 Bot (fluxo): ${msg.body.substring(0, 50)}...`);
        return;
    }

    const currentYear = new Date().getFullYear();
    let prompt = msg.body;

    if (texto.startsWith('pesquise ') || texto.startsWith('pesquisar ')) {
        const query = msg.body.replace(/^(?:pesquise|pesquisar)\s+/i, '');
        prompt = `Pesquise sobre "${query}" e me dê uma resposta completa e detalhada. Use os dados mais recentes possíveis de ${currentYear}. Inclua informações relevantes, estatísticas atuais, curiosidades e dicas práticas. Formate com *negrito* e listas quando apropriado. Se não tiver dados exatos de ${currentYear}, informe a fonte mais recente que conhece.`;
        const searchingMsg = await msg.reply('🔍 *Pesquisando...* Aguarde um momento.');
        let searchPrompt = aiConfig.systemPrompt;
        if (loggedUsers[senderId]) {
            searchPrompt += `\n\nCONTEXTO DO USUÁRIO:
- Nome: ${loggedUsers[senderId].name}
- Telephone: ${senderId}
- Você DEVE chamar o usuário pelo nome quando apropriado`;
        }
        const aiResponse = await queryMimo(senderId, prompt, searchPrompt);
        if (aiResponse) {
            await searchingMsg.edit(aiResponse);
            console.log(`📤 Bot (pesquisa): ${aiResponse.substring(0, 50)}...`);
        } else {
            await searchingMsg.edit(config.fallback);
            console.log(`📤 Bot (fallback): ${config.fallback}`);
        }
        return;
    } else if (texto.startsWith('explique ') || texto.startsWith('o que é ')) {
        prompt = `Explique de forma clara, completa e didática: "${msg.body}". Use exemplos práticos, analogias e, quando relevante, cite informações atualizadas de ${currentYear}. Formate com *negrito* para pontos importantes.`;
    } else if (texto.startsWith('como ') || texto.startsWith('como fazer ')) {
        prompt = `Explique passo a passo como fazer: "${msg.body}". Seja detalhado, claro e prático. Use numeração para os passos e *negrito* para termos importantes. Inclua dicas úteis e informações atualizadas de ${currentYear} quando relevante.`;
    } else if (texto.startsWith('qual ') || texto.startsWith('quais ')) {
        prompt = `Responda de forma completa e bem estruturada: "${msg.body}". Forneça detalhes, exemplos práticos e, quando aplicável, dados atualizados de ${currentYear}. Formate com *negrito* e listas.`;
    } else if (texto.startsWith('quanto') || texto.startsWith('qual o preço') || texto.startsWith('quanto custa')) {
        prompt = `Responda com dados atualizados de ${currentYear}: "${msg.body}". Inclua valores, preços ou estimativas atuais quando possível. Formate com *negrito*.`;
    } else if (texto.startsWith('quem') || texto.startsWith('onde') || texto.startsWith('quando')) {
        prompt = `Responda de forma completa: "${msg.body}". Forneça contexto, detalhes relevantes e informações atualizadas de ${currentYear}. Formate com *negrito* para destaque.`;
    }

    let systemPrompt = aiConfig.systemPrompt;
    if (loggedUsers[senderId]) {
        systemPrompt += `\n\nCONTEXTO DO USUÁRIO:
- Nome: ${loggedUsers[senderId].name}
- Telephone: ${senderId}
- Você DEVE chamar o usuário pelo nome quando apropriado
- Personalize suas respostas usando o nome do usuário`;
    }

    const aiResponse = await queryMimo(senderId, prompt, systemPrompt);

    if (aiResponse) {
        await msg.reply(aiResponse);
        console.log(`📤 Bot (Eco Bot): ${aiResponse.substring(0, 50)}...`);
    } else {
        await msg.reply(config.fallback);
        console.log(`📤 Bot (fallback): ${config.fallback}`);
    }
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
});

console.log('🚀 Iniciando bot do WhatsApp...');
console.log('📌 Versão: 4.0.0 (Assistente Completo)');
console.log('🔧 Configuração: Eco Bot + Pesquisa + Arquivos\n');

client.initialize().catch(err => {
    console.error('Erro ao iniciar:', err);
    process.exit(1);
});
