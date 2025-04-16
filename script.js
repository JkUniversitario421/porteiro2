let userType = '';
let userName = '';
let building = '';
let moradores = [];

function addMessage(message, isUser = false) {
  const container = document.getElementById("chat");
  const bubble = document.createElement("div");
  bubble.className = isUser ? "bubble user" : "bubble bot";
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addButton(text, onClick) {
  const container = document.getElementById("chat");
  const button = document.createElement("button");
  button.className = "chat-button";
  button.textContent = text;
  button.onclick = onClick;
  container.appendChild(button);
  container.scrollTop = container.scrollHeight;
}

function askUserType() {
  addMessage("Você é visitante ou entregador?");
  addButton("Visitante", () => {
    userType = "Visitante";
    addMessage("Visitante", true);
    askUserName();
  });
  addButton("Entregador", () => {
    userType = "Entregador";
    addMessage("Entregador", true);
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
  addMessage("Em qual prédio você está?");
  addButton("411", () => {
    building = "411";
    addMessage("411", true);
    fetchMoradores();
  });
  addButton("421", () => {
    building = "421";
    addMessage("421", true);
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
  addMessage("Selecione o morador:");
  fetch("https://sheetdb.io/api/v1/3jmbakmuen9nd")
    .then(response => response.json())
    .then(data => {
      moradores = data.filter(m => m.Prédio === building);
      if (moradores.length === 0) {
        addMessage("Nenhum morador encontrado para esse prédio.");
      } else {
        moradores.forEach(m => {
          addButton(m.Nome, () => {
            addMessage(m.Nome, true);
            openWhatsApp(m.WhatsApp, m.Nome);
          });
        });
      }
    })
    .catch(error => {
      console.error(error);
      addMessage("Erro ao carregar moradores. Tente novamente.");
    });
}

function openWhatsApp(phone, moradorNome) {
  const message =
    userType === "Visitante"
      ? `Olá ${moradorNome}, o visitante ${userName} está no portão do prédio ${building}.`
      : `Olá ${moradorNome}, o entregador ${userName} está no portão do prédio ${building}.`;

  const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

window.onload = () => {
  askUserType();
};
