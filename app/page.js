"use client";

import { useEffect, useRef, useState } from "react";

const UI = {
  title: "Login", placeholderUser: "Username", placeholderPass: "Password", btnEnter: "Enter",
  chooseText: "CHOOSE", labelBlue: "BLUE", labelRed: "RED", profileH2: "Welcome!",
  profileP: "You are logged in.", oracleH2: "THE ORACLE", btnOk: "OK",
  msgWelcome: "Welcome.", msgInvalid: "Invalid username or password.",
  titleGranted: "ACCESS GRANTED", titleDenied: "ACCESS DENIED", titleRedPill: "RED PILL",
  msgRedPill: 'Oracle. will show you the "way".'
};

export default function Home() {
  const [screen, setScreen] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [modal, setModal] = useState(null);
  const canvasRef = useRef(null);

  const revealKey = async () => {
    const r = await fetch("/api/reveal", { cache: "no-store" });
    const data = await r.json();
    setKeyValue(data.value);
    setScreen("key");
  };

  useEffect(() => {
    document.title = UI.title;
    const params = new URLSearchParams(window.location.search);
    if (params.get("program") === "oracle") revealKey();

    window.Oracle = async function(arg) {
      const r = await fetch("/api/oracle", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ arg })
      });
      const data = await r.json();
      if (data.reveal) await revealKey();
      return data.message;
    };
    return () => { delete window.Oracle; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const chars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 16;
    let columns, drops, timer;
    let secretTurn = 0;
    let secretDrops = {};
    let pendingSecret = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => -Math.floor(Math.random() * 40));
    }
    resize();
    window.addEventListener("resize", resize);

    async function maybeStartSecret() {
      if (Object.keys(secretDrops).length || pendingSecret || Math.random() >= 0.02) return;
      pendingSecret = true;
      try {
        const kind = secretTurn++ % 2 === 0 ? "user" : "pass";
        const r = await fetch(`/api/secret?kind=${kind}`, { cache: "no-store" });
        const data = await r.json();
        const col = Math.floor(Math.random() * columns);
        secretDrops[col] = { word: data.value, index: 0 };
      } finally { pendingSecret = false; }
    }

    function draw() {
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";
      maybeStartSecret();
      for (let i = 0; i < drops.length; i++) {
        let text;
        const secret = secretDrops[i];
        if (secret) {
          text = secret.word[secret.index];
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#0f0";
          ctx.shadowBlur = 8;
          secret.index++;
          if (secret.index >= secret.word.length) delete secretDrops[i];
        } else {
          text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = "#0a8a0a";
          ctx.shadowBlur = 0;
        }
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    timer = setInterval(draw, 40);
    return () => { clearInterval(timer); window.removeEventListener("resize", resize); };
  }, []);

  async function login() {
    const r = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (r.ok) setModal({ kind: "success", title: UI.titleGranted, message: UI.msgWelcome, next: "pill" });
    else setModal({ kind: "error", title: UI.titleDenied, message: UI.msgInvalid });
  }

  function closeModal() {
    const next = modal?.next;
    setModal(null);
    if (next) setScreen(next);
  }

  function keyDown(e) { if (e.key === "Enter") login(); }

  return <>
    <canvas id="matrix" ref={canvasRef}></canvas>
    <div className={`screen ${screen === "login" ? "active" : ""}`} id="screen-login">
      <div className="login-inner">
        <input type="text" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={keyDown} placeholder={UI.placeholderUser}/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={keyDown} placeholder={UI.placeholderPass}/>
        <button onClick={login}>{UI.btnEnter}</button>
      </div>
    </div>
    <div className={`screen ${screen === "pill" ? "active" : ""}`} id="screen-pill">
      <div className="choose-text">{UI.chooseText}</div>
      <div className="pill-row">
        <div><button className="pill blue" onClick={()=>{setUsername("");setPassword("");setScreen("login")}} aria-label="Blue pill"></button><div className="pill-label">{UI.labelBlue}</div></div>
        <div><button className="pill red" onClick={()=>setModal({kind:"success",title:UI.titleRedPill,message:UI.msgRedPill})} aria-label="Red pill"></button><div className="pill-label">{UI.labelRed}</div></div>
      </div>
    </div>
    <div className={`screen ${screen === "profile" ? "active" : ""}`} id="screen-profile"><div className="profile-box"><h2>{UI.profileH2}</h2><p>{UI.profileP}</p></div></div>
    <div className={`screen ${screen === "key" ? "active" : ""}`} id="screen-key"><div className="key-box"><h2>{UI.oracleH2}</h2><div className="key-value">{keyValue}</div></div></div>
    <div className={`modal-overlay ${modal ? "show" : ""}`}><div className={`modal-box ${modal?.kind || ""}`}><h3>{modal?.title}</h3><p>{modal?.message}</p><button onClick={closeModal}>{UI.btnOk}</button></div></div>
  </>;
}
