
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
  const container = document.getElementById("input-container");
  const button = document.createElement("button");
  button.textContent = text;
  button.className = "chat-button";
  button.onclick = onClick;
  container.appendChild(button);
}

function clearInputArea() {
  const inputArea = document.getElementById("input-container");
  inputArea.innerHTML = "";
}

function askUserType() {
  addMessage("Você é visitante ou entregador?");
  clearInputArea();
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
  clearInputArea();
  const input = document.createElement("input");
  input.type = "text";
  input.id = "textInput";
  input.placeholder = "Digite seu nome";
  const button = document.createElement("button");
  button.textContent = "Enviar";
  button.className = "chat-button";
  button.onclick = () => {
    const name = input.value.trim();
    if (name) {
      userName = name;
      addMessage(name, true);
      askBuilding();
    }
  };
  const container = document.getElementById("input-container");
  container.appendChild(input);
  container.appendChild(button);
}

function askBuilding() {
  addMessage("Em qual prédio você está?");
  clearInputArea();
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

function fetchMoradores() {
  addMessage("Buscando moradores...");
  clearInputArea();

  fetch("https://sheetdb.io/api/v1/3jmbakmuen9nd")
    .then(response => response.json())
    .then(data => {
      const lista = data.filter(m =>
        m["Prédio"] === building || m["Predio"] === building
      );

      if (!lista || lista.length === 0) {
        addMessage("Nenhum morador encontrado para esse prédio.");
        return;
      }

      addMessage("Selecione o morador:");
      lista.forEach(m => {
        const nome = m.Nome || "Sem nome";
        const tel = m.WhatsApp || m.Telefone || "";
        if (tel) {
          addButton(nome, () => {
            addMessage(nome, true);
            openWhatsApp(tel, nome);
          });
        }
      });
    })
    .catch(err => {
      console.error("Erro ao buscar moradores:", err);
      addMessage("Erro ao carregar moradores. Tente novamente.");
    });
}

function openWhatsApp(phone, moradorNome) {
  const numero = phone.replace(/\D/g, "");
  const mensagem =
    userType === "Visitante"
      ? `Olá ${moradorNome}, o visitante ${userName} está no portão do prédio ${building}.`
      : `Olá ${moradorNome}, o entregador ${userName} está no portão do prédio ${building}.`;

  const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

window.onload = () => {
  askUserType();
};
