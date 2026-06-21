const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const FLOWS_COLLECTION = 'flows';

let db = null;

try {
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    db = admin.firestore();
  }
} catch (err) {
  console.error('Erro ao conectar Firebase:', err.message);
}

const userFlows = {};

async function getActiveFlows() {
  if (!db) return [];
  try {
    const snapshot = await db.collection(FLOWS_COLLECTION)
      .where('active', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Erro ao buscar fluxos:', err.message);
    return [];
  }
}

async function handleFlowMessage(userId, message, sendMessage) {
  const flowState = userFlows[userId];

  if (!flowState) {
    const flows = await getActiveFlows();
    if (flows.length === 0) return false;

    const triggerFlow = flows.find(f =>
      f.nodes && f.nodes.some(n => n.type === 'start')
    );

    if (!triggerFlow) return false;

    const startNode = triggerFlow.nodes.find(n => n.type === 'start');
    userFlows[userId] = {
      flowId: triggerFlow.id,
      currentNodeId: startNode.id,
      variables: {},
      flow: triggerFlow
    };

    return await processCurrentNode(userId, sendMessage);
  }

  return await processCurrentNode(userId, sendMessage, message);
}

async function processCurrentNode(userId, sendMessage, userInput) {
  userInput = userInput || null;
  const state = userFlows[userId];
  if (!state) return false;

  const node = state.flow.nodes.find(n => n.id === state.currentNodeId);
  if (!node) {
    delete userFlows[userId];
    return false;
  }

  switch (node.type) {
    case 'start': {
      const nextEdge = state.flow.edges.find(e => e.source === node.id);
      if (nextEdge) {
        state.currentNodeId = nextEdge.target;
        return await processCurrentNode(userId, sendMessage);
      }
      return false;
    }

    case 'message': {
      await sendMessage(node.data.text || '');
      const nextEdge = state.flow.edges.find(e => e.source === node.id);
      if (nextEdge) {
        state.currentNodeId = nextEdge.target;
        return await processCurrentNode(userId, sendMessage);
      }
      delete userFlows[userId];
      return true;
    }

    case 'image': {
      const caption = node.data.caption || '';
      await sendMessage(node.data.url + '\n' + caption);
      const nextEdge = state.flow.edges.find(e => e.source === node.id);
      if (nextEdge) {
        state.currentNodeId = nextEdge.target;
        return await processCurrentNode(userId, sendMessage);
      }
      delete userFlows[userId];
      return true;
    }

    case 'buttons': {
      let text = node.data.text || 'Escolha uma opcao:';
      const buttons = node.data.buttons || [];
      if (buttons.length > 0) {
        text += '\n\n' + buttons.map((b, i) => (i + 1) + '. ' + b).join('\n');
      }
      await sendMessage(text);
      return true;
    }

    case 'condition': {
      if (userInput) {
        const { variable, operator, value } = node.data;
        const varValue = state.variables[variable] || userInput;
        let matches = false;

        switch (operator) {
          case 'equals':
            matches = varValue.toLowerCase() === value.toLowerCase();
            break;
          case 'contains':
            matches = varValue.toLowerCase().includes(value.toLowerCase());
            break;
          case 'startsWith':
            matches = varValue.toLowerCase().startsWith(value.toLowerCase());
            break;
          case 'not':
            matches = varValue.toLowerCase() !== value.toLowerCase();
            break;
        }

        const edgeId = matches ? 'true' : 'false';
        const nextEdge = state.flow.edges.find(
          e => e.source === node.id && e.sourceHandle === edgeId
        );
        if (nextEdge) {
          state.currentNodeId = nextEdge.target;
          return await processCurrentNode(userId, sendMessage, userInput);
        }
      }
      return true;
    }

    case 'waitInput': {
      if (userInput) {
        if (node.data.saveAs) {
          state.variables[node.data.saveAs] = userInput;
        }
        const nextEdge = state.flow.edges.find(e => e.source === node.id);
        if (nextEdge) {
          state.currentNodeId = nextEdge.target;
          return await processCurrentNode(userId, sendMessage, userInput);
        }
      } else if (node.data.prompt) {
        await sendMessage(node.data.prompt);
      }
      return true;
    }

    case 'delay': {
      const seconds = node.data.seconds || 5;
      await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      const nextEdge = state.flow.edges.find(e => e.source === node.id);
      if (nextEdge) {
        state.currentNodeId = nextEdge.target;
        return await processCurrentNode(userId, sendMessage);
      }
      delete userFlows[userId];
      return true;
    }

    case 'transfer': {
      await sendMessage(node.data.message || 'Transferindo para atendente...');
      delete userFlows[userId];
      return true;
    }

    case 'end': {
      if (node.data.message) {
        await sendMessage(node.data.message);
      }
      delete userFlows[userId];
      return true;
    }

    default:
      delete userFlows[userId];
      return false;
  }
}

function resetUserFlow(userId) {
  delete userFlows[userId];
}

module.exports = { handleFlowMessage, resetUserFlow, getActiveFlows };
