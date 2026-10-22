/* =========================================================
   Convite Gabi 20
   ========================================================= */

// ---------- Configurações (é só mexer aqui) ----------
const CONFIG = {
  whatsapp: "5541987237109", // 55 + DDD + número, só dígitos
  mensagemWhatsapp: "Oi! Confirmo minha presença no aniversário de 20 anos da Gabi! 🧡",
  endereco: "Rua Leone Décimo Dal Negro, 440, São José dos Pinhais, PR",
  playlist: "https://open.spotify.com/playlist/5MaOGSL6HclcesfUGqnuGZ?si=zH2oFz7BTTW6oaxx_TpZuA&utm_source=copy-link&pt=8c03459169b79f03438d899167aef3ea&pi=eIUnNLvDTvyWM",
  dataFesta: "2026-11-14T13:00:00-03:00", // horário de Brasília
  volume: 0.3, // 0 a 1
};

// ---------- Links dos botões ----------
document.getElementById("linkConfirmar").href =
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensagemWhatsapp)}`;

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
