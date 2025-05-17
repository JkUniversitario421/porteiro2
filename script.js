const chatBox = document.getElementById('chat-box');
const inputContainer = document.getElementById('input-container');

function addMessage(text, sender = 'bot') {
  const message = document.createElement('div');
  message.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearInput() {
  inputContainer.innerHTML = '';
}

function createButton(text, callback) {
  const button = document.createElement('button');
  button.textContent = text;
  button.onclick = callback;
  inputContainer.appendChild(button);
}

function startChat() {
  addMessage("Olá! Eu sou o porteiro virtual. Qual é o seu bloco?");
  clearInput();

  createButton('Bloco A', () => selectBloco('A'));
  createButton('Bloco B', () => selectBloco('B'));
}

function selectBloco(bloco) {
  addMessage(`Bloco ${bloco}`, 'user');
  addMessage(`Você selecionou o Bloco ${bloco}. Qual tipo de visitante você quer autorizar?`);
  clearInput();

  createButton('Prestador de serviço', () => selectTipo(bloco, 'Prestador de serviço'));
  createButton('Entrega', () => selectTipo(bloco, 'Entrega'));
  createButton('Visitante', () => selectTipo(bloco, 'Visitante'));
}

function selectTipo(bloco, tipo) {
  addMessage(tipo, 'user');
  addMessage(`Você selecionou "${tipo}". Qual o nome da pessoa que irá autorizar a entrada?`);
  clearInput();

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Digite seu nome...';
  inputContainer.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'Enviar';
  button.onclick = () => {
    const nome = input.value.trim();
    if (nome) {
      selectNome(bloco, tipo, nome);
    } else {
      alert('Por favor, digite seu nome.');
    }
  };
  inputContainer.appendChild(button);
}

function selectNome(bloco, tipo, nome) {
  addMessage(nome, 'user');
  addMessage(`Entrada autorizada para ${tipo} no Bloco ${bloco}, autorizado por ${nome}.`);
  clearInput();

  createButton('Início', startChat);
}

// Iniciar o chat automaticamente
startChat();
