/* =========================================================
   Convite Gabi 20
   ========================================================= */

// ---------- Configurações (é só mexer aqui) ----------
const CONFIG = {
  whatsapp: "5541987237109", // 55 + DDD + número, só dígitos
  mensagemWhatsapp: "Oi! Confirmo minha presença no aniversário de 20 anos da Gabi! 🧡",
  endereco: "Rua Leone Décimo Dal Negro, 440, São José dos Pinhais, PR",
  playlist: "https://open.spotify.com/playlist/5MaOGSL6HclcesfUGqnuGZ?si=oEltRBuaQ-68g60RJJUbjg&utm_source=copy-link&pt=0c5efc1fd83c695ec27b1af8aece8c66&pi=vYFDfmNGROavv",
  dataFesta: "2026-11-14T14:00:00-03:00", // horário de Brasília
  volume: 0.3, // 0 a 1

  // Link do Apps Script da planilha de presença (veja o arquivo planilha-presenca.gs)
  planilhaPresenca: "https://script.google.com/macros/s/AKfycbzq_krTjMzaN6_q2C5TmfOCbzv6qjvG9lwVCfu5XyCQrR3wXDwnWquNNyHQA00AVg0vAw/exec",
  maxPessoas: 3,
};

// ---------- Links dos botões ----------

document.getElementById("linkLocal").href =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;

document.getElementById("linkPlaylist").href = CONFIG.playlist;

// ---------- Abertura do envelope ----------
const body = document.body;
const selo = document.getElementById("selo");
const telaEnvelope = document.getElementById("telaEnvelope");
const telaConvite = document.getElementById("telaConvite");
const musica = document.getElementById("musica");
const botaoSom = document.getElementById("botaoSom");

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let aberto = false;

selo.addEventListener("click", abrirConvite);

function abrirConvite() {
  if (aberto) return;
  aberto = true;

  tocarMusica(); // precisa acontecer dentro do clique, senão o celular bloqueia

  body.classList.add("abrindo"); // selo quebra + aba abre

  setTimeout(() => {
    body.classList.add("entrando"); // zoom pra dentro + convite sobe
    telaConvite.removeAttribute("aria-hidden");
  }, reduzirMovimento ? 150 : 850);

  setTimeout(() => {
    telaEnvelope.hidden = true;
    telaEnvelope.style.display = "none";
    telaConvite.focus({ preventScroll: true });
  }, reduzirMovimento ? 700 : 2300);
}

// ---------- Música de fundo ----------
function tocarMusica() {
  musica.volume = 0;
  musica.play()
    .then(() => {
      botaoSom.hidden = false;
      subirVolume();
    })
    .catch(() => {
      // se o navegador bloquear, deixa o botão pra pessoa ligar
      botaoSom.hidden = false;
      botaoSom.classList.add("desligado");
      botaoSom.setAttribute("aria-label", "Ligar música");
    });
}

// alguns celulares (iPhone) ignoram o volume via código; aí toca no volume do aparelho
function subirVolume() {
  const passo = CONFIG.volume / 20;
  const intervalo = setInterval(() => {
    musica.volume = Math.min(CONFIG.volume, musica.volume + passo);
    if (musica.volume >= CONFIG.volume) clearInterval(intervalo);
  }, 100);
}

botaoSom.addEventListener("click", () => {
  if (musica.paused) {
    musica.volume = CONFIG.volume;
    musica.play();
    botaoSom.classList.remove("desligado");
    botaoSom.setAttribute("aria-label", "Desligar música");
  } else {
    musica.pause();
    botaoSom.classList.add("desligado");
    botaoSom.setAttribute("aria-label", "Ligar música");
  }
});

// pausa se a pessoa sair do app (ex.: foi pro WhatsApp) e volta quando retornar
let pausadaPeloSistema = false;
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !musica.paused) {
    musica.pause();
    pausadaPeloSistema = true;
  } else if (!document.hidden && pausadaPeloSistema) {
    musica.play().catch(() => {});
    pausadaPeloSistema = false;
  }
});

// ---------- Contagem regressiva ----------
const alvo = new Date(CONFIG.dataFesta).getTime();
const campos = {
  dias: document.getElementById("cDias"),
  horas: document.getElementById("cHoras"),
  min: document.getElementById("cMin"),
  seg: document.getElementById("cSeg"),
};
const doisDigitos = (n) => String(n).padStart(2, "0");

function atualizarContagem() {
  const falta = alvo - Date.now();

  if (falta <= 0) {
    document.getElementById("contagem").innerHTML =
      '<p class="contagem-fim">é hoje! a festa já começou 🧡</p>';
    clearInterval(timerContagem);
    return;
  }

  campos.dias.textContent = Math.floor(falta / 86400000);
  campos.horas.textContent = doisDigitos(Math.floor((falta / 3600000) % 24));
  campos.min.textContent = doisDigitos(Math.floor((falta / 60000) % 60));
  campos.seg.textContent = doisDigitos(Math.floor((falta / 1000) % 60));
}

const timerContagem = setInterval(atualizarContagem, 1000);
atualizarContagem();

// ---------- Confirmação de presença ----------
const rsvpFundo = document.getElementById("rsvpFundo");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpNome = document.getElementById("rsvpNome");
const rsvpPessoas = document.getElementById("rsvpPessoas");
const rsvpEnviar = document.getElementById("rsvpEnviar");
const rsvpErroNome = document.getElementById("rsvpErroNome");
const rsvpErroEnvio = document.getElementById("rsvpErroEnvio");
let pessoas = 1;

function abrirRsvp() {
  rsvpFundo.hidden = false;
  setTimeout(() => rsvpNome.focus(), 300);
}
function fecharRsvp() {
  rsvpFundo.hidden = true;
}

document.getElementById("botaoConfirmar").addEventListener("click", abrirRsvp);
document.getElementById("rsvpFechar").addEventListener("click", fecharRsvp);
rsvpFundo.addEventListener("click", (e) => { if (e.target === rsvpFundo) fecharRsvp(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !rsvpFundo.hidden) fecharRsvp(); });

function mudarPessoas(delta) {
  pessoas = Math.min(CONFIG.maxPessoas, Math.max(1, pessoas + delta));
  rsvpPessoas.textContent = pessoas;
}
document.getElementById("rsvpMenos").addEventListener("click", () => mudarPessoas(-1));
document.getElementById("rsvpMais").addEventListener("click", () => mudarPessoas(1));

rsvpNome.addEventListener("input", () => { rsvpErroNome.hidden = true; });

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = rsvpNome.value.trim();
  if (!nome) {
    rsvpErroNome.hidden = false;
    rsvpNome.focus();
    return;
  }

  rsvpErroEnvio.hidden = true;
  rsvpEnviar.disabled = true;
  rsvpEnviar.textContent = "Enviando...";

  try {
    // "text/plain" e "no-cors" evitam o bloqueio de segurança do navegador com o Google
    await fetch(CONFIG.planilhaPresenca, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ nome, pessoas }),
    });

    const texto = pessoas === 1 ? "Te esperamos lá!" : `Te esperamos lá, vocês ${pessoas}!`;
    document.getElementById("rsvpOkTexto").textContent = texto;
    const acompanhantes = ["", " e mais uma pessoa", " e mais duas pessoas"][pessoas - 1];
    const recado = pessoas === 1
      ? `Oi! Aqui é ${nome}, confirmei minha presença no aniversário de 20 anos da Gabi! 🧡`
      : `Oi! Aqui é ${nome}, confirmei presença no aniversário de 20 anos da Gabi: eu${acompanhantes}! 🧡`;
    document.getElementById("rsvpWhats").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(recado)}`;
    rsvpForm.hidden = true;
    document.getElementById("rsvpOk").hidden = false;
  } catch (erro) {
    rsvpErroEnvio.hidden = false;
  } finally {
    rsvpEnviar.disabled = false;
    rsvpEnviar.textContent = "Confirmar presença";
  }
});
