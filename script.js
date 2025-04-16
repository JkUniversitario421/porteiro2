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
  const nome = document.getElementById("nomeVisitante").value.trim();
  if (!nome) return;
  chatState.nome = nome;
  addMessage(nome, "user");
  botTyping(() => {
    addMessage("Selecione o morador:");
    carregarMoradores(chatState.bloco);
  });
}

function carregarMoradores(bloco) {
  fetch("https://sheetdb.io/api/v1/3jmbakmuen9nd?sheet=Contatos")
    .then(res => res.json())
    .then(data => {
      const moradores = data.filter(p => p["Prédio"] == bloco || p["Predio"] == bloco); // aceita com ou sem acento
      inputContainer.innerHTML = "";
      if (moradores.length === 0) {
        addMessage("Nenhum morador encontrado para esse prédio.");
        return;
      }
      moradores.forEach(pessoa => {
        const btn = document.createElement("button");
        btn.textContent = pessoa.Nome;
        btn.onclick = () => enviarParaMorador(pessoa);
        inputContainer.appendChild(btn);
      });
    })
    .catch(err => {
      console.error("Erro ao buscar moradores:", err);
      addMessage("Erro ao carregar moradores. Tente novamente.");
    });
}

function enviarParaMorador(pessoa) {
  addMessage(pessoa.Nome, "user");
  const msg =
    chatState.tipo === "Visitante"
      ? `Olá ${pessoa.Nome}, meu nome é ${chatState.nome} e estou na portaria como visitante do prédio ${chatState.bloco}.`
      : `Olá ${pessoa.Nome}, meu nome é ${chatState.nome} e estou na portaria com uma entrega para você no prédio ${chatState.bloco}.`;
  const link = `https://wa.me/${pessoa.Telefone}?text=${encodeURIComponent(msg)}`;
  botTyping(() => {
    addMessage("Clique abaixo para chamar o morador:");
    inputContainer.innerHTML = `<a href="${link}" target="_blank"><button>Chamar ${pessoa.Nome} no WhatsApp</button></a>`;
  });
}

startChat();
