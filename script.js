let userType = '';
let userName = '';
let building = '';
let moradores = [];

function addMessage(message, isUser = false) {
  const container = document.getElementById("chat");
  const bubble = document.createElement("div");
  bubble.className = isUser ? "user-message" : "bot-message";
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addButton(text, onClick) {
  const container = document.getElementById("chat");
  const button = document.createElement("button");
  button.textContent = text;
  button.className = "chat-button";
  button.onclick = onClick;
  container.appendChild(button);
  container.scrollTop = container.scrollHeight;
}

function clearButtons() {
  const buttons = document.querySelectorAll("button.chat-button");
  buttons.forEach(btn => btn.remove());
}

function askUserType() {
  addMessage("Você é visitante ou entregador?");
  addButton("Visitante", () => {
    userType = "Visitante";
    addMessage("Visitante", true);
    clearButtons();
    askUserName();
  });
  addButton("Entregador", () => {
    userType = "Entregador";
    addMessage("Entregador", true);
    clearButtons();
    askUserName();
  });
}

function askUserName() {
  addMessage("Qual o seu nome?");
  showInput((name) => {
    userName = name;
    addMessage(name, true);
    askBuilding();
  });
}

function askBuilding() {
  addMessage("Qual o número do prédio?");
  addButton("411", () => {
    building = "411";
    addMessage("Prédio 411", true);
    clearButtons();
    fetchMoradores();
  });
  addButton("421", () => {
    building = "421";
    addMessage("Prédio 421", true);
    clearButtons();
    fetchMoradores();
  });
}

function showInput(callback) {
  const inputArea = document.getElementById("input-area");
  inputArea.innerHTML = `
    <input type="text" id="textInput" placeholder="Digite aqui..." />
    <button onclick="handleInput()">Enviar</button>
  `;
  window.handleInput = () => {
    const value = document.getElementById("textInput").value;
    if (value.trim() !== "") {
      inputArea.innerHTML = "";
      callback(value);
    }
  };
}

function fetchMoradores() {
  addMessage("Carregando moradores do prédio " + building + "...");
  fetch("https://sheetdb.io/api/v1/3jmbakmuen9nd")
    .then(res => res.json())
    .then(data => {
      const moradoresFiltrados = data.filter(p => p.Prédio === building || p.Predio === building);
      if (!moradoresFiltrados.length) {
        addMessage("Nenhum morador encontrado nesse prédio.");
        return;
      }

      addMessage("Selecione o morador:");
      moradoresFiltrados.forEach(pessoa => {
        addButton(pessoa.Nome, () => {
          addMessage(pessoa.Nome, true);
          clearButtons();
          openWhatsApp(pessoa.WhatsApp || pessoa.Telefone, pessoa.Nome);
        });
      });
    })
    .catch(err => {
      console.error("Erro ao buscar moradores:", err);
      addMessage("Erro ao carregar moradores. Tente novamente.");
    });
}

function openWhatsApp(phone, nomeMorador) {
  const mensagem =
    userType === "Visitante"
      ? `Olá ${nomeMorador}, o visitante ${userName} está na portaria do prédio ${building}.`
      : `Olá ${nomeMorador}, o entregador ${userName} está na portaria do prédio ${building}.`;

  const link = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
  addMessage("Clique no botão abaixo para abrir o WhatsApp:");
  const container = document.getElementById("chat");
  const a = document.createElement("a");
  a.href = link;
  a.target = "_blank";
  a.innerHTML = `<button class="chat-button">Chamar ${nomeMorador}</button>`;
  container.appendChild(a);
  container.scrollTop = container.scrollHeight;
}

window.onload = () => {
  askUserType();
};
