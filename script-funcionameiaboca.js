const chatBox = document.getElementById("chat-box");
const inputContainer = document.getElementById("input-container");

let chatState = { step: 0, bloco: "", tipo: "", plataforma: "", nome: "" };

function botTyping(callback, delay = 1000) {
    const typingMsg = document.createElement("div");
    typingMsg.className = "bot-message";
    typingMsg.id = "typing-indicator";
    typingMsg.textContent = "digitando...";
    chatBox.appendChild(typingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        const indic = document.getElementById("typing-indicator");
        if (indic) indic.remove();
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
    });
}

function selectTipo(tipo) {
    chatState.tipo = tipo;
    addMessage(tipo, "user");

    if (tipo === "Entregador") {
        botTyping(() => {
            addMessage("De qual plataforma é a entrega?");
            inputContainer.innerHTML = `
                <button onclick="selectPlataforma('Shopee')">Shopee</button>
                <button onclick="selectPlataforma('Mercado Livre')">Mercado Livre</button>
                <button onclick="selectPlataforma('Amazon')">Amazon</button>
                <button onclick="plataformaOutros()">Outros</button>
            `;
        });
    } else {
        botTyping(() => {
            addMessage("Qual o seu nome?");
            inputContainer.innerHTML = `
                <input type="text" id="nomeVisitante" placeholder="Digite seu nome" />
                <button onclick="enviarNomeVisitante()">Enviar</button>
            `;
        });
    }
}

function plataformaOutros() {
    botTyping(() => {
        addMessage("Por favor, informe o nome da plataforma:");
        inputContainer.innerHTML = `
            <input type="text" id="outraPlataforma" placeholder="Digite o nome da plataforma" />
            <button onclick="selectPlataformaOutros()">Enviar</button>
        `;
    });
}

function selectPlataformaOutros() {
    const plataforma = document.getElementById("outraPlataforma").value.trim();
    if (!plataforma) return;
    chatState.plataforma = plataforma;
    addMessage(plataforma, "user");
    selecionarMorador();
}

function selectPlataforma(plataforma) {
    chatState.plataforma = plataforma;
    addMessage(plataforma, "user");
    selecionarMorador();
}

function enviarNomeVisitante() {
    const nome = document.getElementById("nomeVisitante").value.trim();
    if (!nome) return;
    chatState.nome = nome;
    addMessage(nome, "user");
    selecionarMorador();
}

function selecionarMorador() {
    botTyping(() => {
        addMessage("Selecione o morador:");

        fetch("https://sheetdb.io/api/v1/3jmbakmuen9nd")
            .then(res => res.json())
            .then(data => {
                console.log("Dados da planilha recebidos:", data);

                const moradores = data.filter(p =>
                    p.Nome && p.Nome.trim() !== "" &&
                    p.Predio && p.Predio.toString().trim() !== "" &&
                    p.Telefone && p.Telefone.trim() !== "" &&
                    p.Predio.toString().trim() === chatState.bloco.toString().trim()
                );

                inputContainer.innerHTML = "";

                if (moradores.length === 0) {
                    addMessage("Nenhum morador encontrado para o prédio selecionado.");
                    return;
                }

                moradores.forEach(pessoa => {
                    const btn = document.createElement("button");
                    btn.textContent = pessoa.Nome;
                    btn.onclick = () => enviarParaMorador(pessoa);
                    inputContainer.appendChild(btn);
                });
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                addMessage("Erro ao buscar moradores.");
            });
    });
}

function enviarParaMorador(pessoa) {
    addMessage(pessoa.Nome, "user");

    const msg = chatState.tipo === "Visitante"
        ? `Olá ${pessoa.Nome}, aqui é ${chatState.nome} estou na frente do prédio nº ${chatState.bloco}, poderia me receber?`
        : `Olá ${pessoa.Nome}, estou com a sua entrega da ${chatState.plataforma} em frente ao nº ${chatState.bloco}. Poderia vir buscar?`;

    const telefoneFormatado = pessoa.Telefone.replace(/\D/g, '');
    const link = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(msg)}`;

    botTyping(() => {
        addMessage("Clique abaixo para chamar o morador:");
        inputContainer.innerHTML = `<a href="${link}" target="_blank"><button>Chamar ${pessoa.Nome} no WhatsApp</button></a>`;
    });
}

startChat();
