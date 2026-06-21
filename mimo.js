const { execSync } = require('child_process');

let userHistories = {};

function buildPrompt(userId, userMessage, systemPrompt) {
    const history = userHistories[userId] || [];
    let prompt = systemPrompt + '\n\n';

    for (const msg of history) {
        if (msg.role === 'user') {
            prompt += `Usuário: ${msg.content}\n`;
        } else {
            prompt += `Assistente: ${msg.content}\n`;
        }
    }

    prompt += `Usuário: ${userMessage}\nAssistente:`;
    return prompt;
}

function queryMimo(userId, userMessage, systemPrompt) {
    try {
        if (!userHistories[userId]) {
            userHistories[userId] = [];
        }

        userHistories[userId].push({ role: 'user', content: userMessage });
        if (userHistories[userId].length > 20) {
            userHistories[userId] = userHistories[userId].slice(-20);
        }

        const prompt = buildPrompt(userId, userMessage, systemPrompt);
        const escaped = prompt.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        const command = `mimo run "${escaped}" 2>/dev/null`;

        const result = execSync(command, {
            encoding: 'utf8',
            timeout: 30000,
            maxBuffer: 1024 * 1024
        });

        let reply = result.trim();

        const lines = reply.split('\n');
        let cleanReply = '';
        for (const line of lines) {
            if (line.startsWith('>') || line.includes('build') || line.includes('·')) continue;
            cleanReply += line + '\n';
        }
        reply = cleanReply.trim();

        if (!reply) return null;

        userHistories[userId].push({ role: 'assistant', content: reply });
        return reply;
    } catch (e) {
        console.error('Erro MiMo CLI:', e.message);
        return null;
    }
}

function limparHistorico(userId) {
    if (userId === 'all') {
        userHistories = {};
    } else {
        delete userHistories[userId];
    }
}

module.exports = { queryMimo, limparHistorico };
