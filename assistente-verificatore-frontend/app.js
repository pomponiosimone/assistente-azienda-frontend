// LOCALE: http://localhost:3000
// Quando metteremo il backend su Koyeb, sostituiremo questa URL con quella pubblica.
const API_URL = "https://frightened-lynelle-simonezo-e3f8c68d.koyeb.app";

const form = document.getElementById("chatForm");
const input = document.getElementById("question");
const chat = document.getElementById("chat");
const suggestions = document.getElementById("suggestions");
const sendBtn = document.getElementById("sendBtn");

function scrollBottom(){ chat.scrollTop = chat.scrollHeight; }

function addMessage(text, role, sources=[]){
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;
  if(role === "assistant"){
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "AI";
    wrap.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  if(sources.length){
    const s = document.createElement("div");
    s.className = "sources";
    s.textContent = "Fonte: " + sources.join(" · ");
    bubble.appendChild(s);
  }
  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  scrollBottom();
  return wrap;
}

async function ask(question){
  if(!question.trim()) return;
  suggestions.style.display = "none";
  addMessage(question, "user");
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;

  const loading = addMessage("Sto cercando nel manuale…", "assistant");
  loading.classList.add("typing");

  try{
    const res = await fetch(`${API_URL}/api/chat`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({domanda:question})
    });
    const data = await res.json();
    loading.remove();

    if(!res.ok) throw new Error(data.errore || "Errore del server");
    addMessage(data.risposta || "Nessuna risposta disponibile.", "assistant", data.fonti || []);
  }catch(err){
    loading.remove();
    addMessage("Non riesco a contattare l'assistente. Controlla che il backend sia avviato.", "assistant");
    console.error(err);
  }finally{
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  ask(input.value);
});

input.addEventListener("keydown", e => {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    form.requestSubmit();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
});

suggestions.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => ask(btn.textContent));
});

document.getElementById("clearBtn").addEventListener("click", () => location.reload());
