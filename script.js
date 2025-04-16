const chatBox = document.getElementById("chat-box");
const inputContainer = document.getElementById("input-container");
let chatState = { step: 0, bloco: "", tipo: "", nome: "" };

function botTyping(callback, delay = 1000) {
  const typingMsg = document.createElement("div");
  typingMsg.className = "bot-message";
  typingMsg.textContent = "Digitando...";
  chatBox.appendChild(typingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  setTimeout(() => {
    typingMsg.remove();
    callback();
  }, delay);
}

function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "bot" ? "bot-message" : "user-message";
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startChat() {
  inputContainer.innerHTML = '<button onclick="startFlow()">Iniciar Atendimento</button>';
}

function startFlow() {
  botTyping(() => {
    addMessage("Em qual prédio você está?");
    inputContainer.innerHTML = `
      <button onclick="selectBloco('411')">411</button>
      <button onclick="selectBloco('421')">421</button>
    `;
    chatState.step = 1;
  });
}

function selectBloco(bloco) {
  chatState.bloco = bloco;
  addMessage(bloco, "user");
  botTyping(() => {
    addMessage("Você é visitante ou entregador?");
    inputContainer.innerHTML = `
      <button onclick="selectTipo('Visitante')">Visitante</button>
      <button onclick="selectTipo('Entregador')">Entregador</button>
    `;
    chatState.step = 2;
  });
}

function selectTipo(tipo) {
  chatState.tipo = tipo;
  addMessage(tipo, "user");
  botTyping(() => {
    addMessage("Qual o seu nome?");
    inputContainer.innerHTML = `
      <input type="text" id="nomeVisitante" placeholder="Digite seu nome" />
      <button onclick="enviarNome()">Enviar</button>
    `;
    chatState.step = 3;
  });
}

function enviarNome() {
  const nome = document.getElementById("nomeVisitante").value;
  if (!nome) return;
  chatState.nome = nome;
  addMessage(nome, "user");
  botTyping(() => {
    addMessage("Selecione o morador:");
    fetch(`https://opensheet.elk.sh/1kY8va8gT2pJE1A3MIOQnFib5tKAFDYryhRUulAqY35U/${chatState.bloco}`)
      .then(res => res.json())
      .then(data => {
        inputContainer.innerHTML = "";
        data.forEach(pessoa => {
          const btn = document.createElement("button");
          btn.textContent = pessoa.Nome;
          btn.onclick = () => enviarParaMorador(pessoa);
          inputContainer.appendChild(btn);
        });
      });
  });
}

function enviarParaMorador(pessoa) {
  addMessage(pessoa.Nome, "user");
  const msg = `Olá ${pessoa.Nome}, meu nome é ${chatState.nome} e estou no portão do prédio ${chatState.bloco}.`;
  const link = `https://wa.me/${pessoa.Telefone}?text=${encodeURIComponent(msg)}`;
  botTyping(() => {
    addMessage("Clique abaixo para chamar o morador:");
    inputContainer.innerHTML = `<a href="${link}" target="_blank"><button>Chamar ${pessoa.Nome} no WhatsApp</button></a>`;
  });
}

startChat();