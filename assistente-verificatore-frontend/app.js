// ONLINE - KOYEB
const API_URL =
  "https://frightened-lynelle-simonezo-e3f8c68d.koyeb.app";


// ==============================
// ELEMENTI LOGIN
// ==============================

const loginScreen = document.getElementById("loginScreen");
const assistantApp = document.getElementById("assistantApp");

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");


// ==============================
// ELEMENTI CHAT
// ==============================

const form = document.getElementById("chatForm");
const input = document.getElementById("question");
const chat = document.getElementById("chat");
const suggestions = document.getElementById("suggestions");
const sendBtn = document.getElementById("sendBtn");


// ==============================
// TOKEN
// ==============================

let token = sessionStorage.getItem("av_token");


// ==============================
// MOSTRA ASSISTENTE
// ==============================

function showAssistant() {
  loginScreen.classList.add("hidden");
  assistantApp.classList.remove("hidden");

  setTimeout(() => {
    input.focus();
  }, 100);
}


// ==============================
// MOSTRA LOGIN
// ==============================

function showLogin() {
  token = null;

  sessionStorage.removeItem("av_token");

  assistantApp.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  passwordInput.value = "";

  setTimeout(() => {
    passwordInput.focus();
  }, 100);
}


// Se esiste già un token nella sessione
if (token) {
  showAssistant();
}


// ==============================
// MOSTRA / NASCONDI PASSWORD
// ==============================

togglePassword.addEventListener("click", () => {

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "👁";
  }

});


// ==============================
// LOGIN
// ==============================

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const password = passwordInput.value.trim();

  if (!password) return;

  loginError.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Accesso...";

  try {

    const res = await fetch(`${API_URL}/api/login`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        password: password
      })

    });


    const data = await res.json();


    if (!res.ok) {

      loginError.textContent =
        data.errore || "Password non corretta.";

      return;
    }


    if (!data.token) {
      loginError.textContent =
        "Errore durante l'accesso.";
      return;
    }


    token = data.token;

    sessionStorage.setItem(
      "av_token",
      token
    );


    passwordInput.value = "";

    showAssistant();


  } catch (error) {

    console.error(error);

    loginError.textContent =
      "Impossibile contattare il server.";

  } finally {

    loginBtn.disabled = false;
    loginBtn.textContent = "Accedi";

  }

});


// ==============================
// CHAT
// ==============================

function scrollBottom() {
  chat.scrollTop = chat.scrollHeight;
}


function addMessage(text, role, sources = []) {

  const wrap = document.createElement("div");

  wrap.className =
    `message ${role}`;


  if (role === "assistant") {

    const avatar =
      document.createElement("div");

    avatar.className = "avatar";
    avatar.textContent = "AI";

    wrap.appendChild(avatar);

  }


  const bubble =
    document.createElement("div");

  bubble.className = "bubble";
  bubble.textContent = text;


  if (sources.length) {

    const s =
      document.createElement("div");

    s.className = "sources";

    s.textContent =
      "Fonte: " + sources.join(" · ");

    bubble.appendChild(s);

  }


  wrap.appendChild(bubble);

  chat.appendChild(wrap);

  scrollBottom();

  return wrap;
}


// ==============================
// DOMANDA
// ==============================

async function ask(question) {

  if (!question.trim()) return;


  suggestions.style.display = "none";

  addMessage(
    question,
    "user"
  );


  input.value = "";
  input.style.height = "auto";

  sendBtn.disabled = true;


  const loading = addMessage(
    "Sto cercando nel manuale…",
    "assistant"
  );

  loading.classList.add("typing");


  try {

    const res = await fetch(
      `${API_URL}/api/chat`,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${token}`

        },

        body: JSON.stringify({
          domanda: question
        })

      }
    );


    const data = await res.json();

    loading.remove();


    // Token mancante o scaduto
    if (res.status === 401) {

      showLogin();

      loginError.textContent =
        "Sessione scaduta. Inserisci nuovamente la password.";

      return;

    }


    if (!res.ok) {

      throw new Error(
        data.errore ||
        "Errore del server"
      );

    }


    addMessage(
      data.risposta ||
      "Nessuna risposta disponibile.",
      "assistant",
      data.fonti || []
    );


  } catch (error) {

    loading.remove();

    addMessage(
      "Si è verificato un problema durante la risposta. Riprova tra qualche secondo.",
      "assistant"
    );

    console.error(error);


  } finally {

    sendBtn.disabled = false;

    if (!assistantApp.classList.contains("hidden")) {
      input.focus();
    }

  }

}


// ==============================
// EVENTI CHAT
// ==============================

form.addEventListener(
  "submit",
  e => {

    e.preventDefault();

    ask(input.value);

  }
);


input.addEventListener(
  "keydown",
  e => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      form.requestSubmit();

    }

  }
);


input.addEventListener(
  "input",
  () => {

    input.style.height = "auto";

    input.style.height =
      Math.min(
        input.scrollHeight,
        120
      ) + "px";

  }
);


suggestions
  .querySelectorAll("button")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => ask(btn.textContent)
    );

  });


document
  .getElementById("clearBtn")
  .addEventListener(
    "click",
    () => location.reload()
  );