import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Check, Sparkles, Send, Star, Moon,
  BookHeart, GraduationCap, CalendarHeart, Loader2
} from "lucide-react";
 
// ---- kawaii palette ----------------------------------------------------
const C = {
  blush: "#FFF0F6",     // page bg
  cream: "#FFFCFE",     // card bg
  pink: "#FF8FB8",      // primary
  hotpink: "#FF5C8A",   // bow / accents
  berry: "#D4396E",     // strong text pop
  plum: "#4A3357",      // body text (soft dark)
  gold: "#FFD86B",      // stars
  lilac: "#E9D5FF",     // secondary pastel
  mint: "#C9F0DD",      // "done" pastel
};
 
const FONT_STACK =
  "'Quicksand','Baloo 2','Comic Sans MS','Segoe UI Rounded',system-ui,sans-serif";
 
const COURSE_CHIPS = [
  "Intro Astronomy", "Astrophysics", "Planetary Science",
  "Stellar Evolution", "Cosmology", "Observational Astro",
  "Physics", "Calculus",
];
 
// ---- safe persistent storage wrapper -----------------------------------
const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const r = await window.storage.get(key);
        return r ? r.value : null;
      }
    } catch { /* key missing or unavailable */ }
    return null;
  },
  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.set(key, value);
      }
    } catch { /* ignore */ }
  },
};
 
// ---- the star-kitty mascot (original art) ------------------------------
function Stella({ mood = "happy", size = 78 }) {
  // mood: happy | chill | worried | sleepy
  const eye = (cx) => {
    if (mood === "sleepy")
      return <path d={`M${cx - 5} 40 q5 4 10 0`} stroke={C.plum} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
    if (mood === "worried")
      return <ellipse cx={cx} cy="41" rx="2.6" ry="3.4" fill={C.plum} />;
    if (mood === "happy")
      return (
        <path
          d={`M${cx} 35 l1.6 3.4 3.8 .4 -2.8 2.6 .8 3.7 -3.4 -1.9 -3.4 1.9 .8 -3.7 -2.8 -2.6 3.8 -.4 z`}
          fill={C.plum}
        />
      ); // little star eyes ✨
    return <circle cx={cx} cy="40" r="3" fill={C.plum} />;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="stella-bob" aria-hidden="true">
      {/* ears */}
      <path d="M20 30 L14 8 L40 24 Z" fill={C.cream} stroke={C.pink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M80 30 L86 8 L60 24 Z" fill={C.cream} stroke={C.pink} strokeWidth="3" strokeLinejoin="round" />
      {/* head */}
      <ellipse cx="50" cy="52" rx="34" ry="30" fill={C.cream} stroke={C.pink} strokeWidth="3" />
      {/* forehead star */}
      <path d="M50 20 l1.4 3 3.3 .3 -2.5 2.2 .7 3.2 -2.9 -1.7 -2.9 1.7 .7 -3.2 -2.5 -2.2 3.3 -.3 z" fill={C.gold} />
      {/* eyes */}
      {eye(38)}
      {eye(62)}
      {/* nose */}
      <ellipse cx="50" cy="48" rx="3.4" ry="2.4" fill={C.hotpink} />
      {/* mouth */}
      {mood === "happy" ? (
        <path d="M44 54 q6 6 12 0" stroke={C.plum} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : mood === "worried" ? (
        <path d="M45 57 q5 -4 10 0" stroke={C.plum} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M46 54 q4 3 8 0" stroke={C.plum} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
      {/* whiskers */}
      <g stroke={C.pink} strokeWidth="2" strokeLinecap="round">
        <line x1="10" y1="48" x2="24" y2="50" />
        <line x1="10" y1="56" x2="24" y2="56" />
        <line x1="90" y1="48" x2="76" y2="50" />
        <line x1="90" y1="56" x2="76" y2="56" />
      </g>
      {/* signature bow (right ear) */}
      <g transform="translate(70 20)">
        <path d="M0 0 L-11 -7 L-11 9 Z" fill={C.hotpink} />
        <path d="M0 0 L11 -7 L11 9 Z" fill={C.hotpink} />
        <circle cx="0" cy="1" r="4.5" fill={C.berry} />
      </g>
    </svg>
  );
}
 
// ---- floating background stars -----------------------------------------
function StarField() {
  const stars = Array.from({ length: 26 });
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const d = 3 + Math.random() * 4;
        const delay = Math.random() * 5;
        const s = 6 + Math.random() * 10;
        return (
          <Star
            key={i}
            className="bg-star"
            size={s}
            style={{
              left: `${left}%`, top: `${top}%`,
              animationDuration: `${d}s`, animationDelay: `${delay}s`,
              color: Math.random() > 0.5 ? C.gold : C.pink,
            }}
          />
        );
      })}
    </div>
  );
}
 
// ---- date helpers ------------------------------------------------------
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return Math.round((due - now) / 86400000);
}
function dueMeta(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return { label: "no date", tone: "none" };
  if (d < 0) return { label: `${Math.abs(d)}d overdue`, tone: "over" };
  if (d === 0) return { label: "due today!", tone: "soon" };
  if (d === 1) return { label: "due tomorrow", tone: "soon" };
  if (d <= 3) return { label: `${d} days left`, tone: "soon" };
  return { label: `${d} days left`, tone: "ok" };
}
 
// =========================================================================
export default function App() {
  const [tab, setTab] = useState("hw");
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
 
  // new-task form
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("active");
 
  // tutor
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi cutie! ✨ I'm Stella, your astro tutor. Stuck on a problem set, a concept, or some scary-looking equation? Tell me what you're working on and we'll figure it out together! 🌙" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatEnd = useRef(null);
 
  // load once
  useEffect(() => {
    (async () => {
      const raw = await store.get("stella_tasks");
      if (raw) { try { setTasks(JSON.parse(raw)); } catch {} }
      setLoaded(true);
    })();
  }, []);
 
  // save on change
  useEffect(() => {
    if (loaded) store.set("stella_tasks", JSON.stringify(tasks));
  }, [tasks, loaded]);
 
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);
 
  const addTask = () => {
    if (!title.trim()) return;
    setTasks((t) => [
      ...t,
      { id: Date.now(), title: title.trim(), course: course.trim(), due, done: false },
    ]);
    setTitle(""); setCourse(""); setDue("");
  };
  const toggle = (id) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id) => setTasks((t) => t.filter((x) => x.id !== id));
 
  const active = tasks.filter((t) => !t.done);
  const doneCount = tasks.length - active.length;
  const overdue = active.some((t) => dueMeta(t.due).tone === "over");
  const allDone = tasks.length > 0 && active.length === 0;
 
  const mascotMood = allDone ? "happy" : overdue ? "worried" : "chill";
  const headline = allDone
    ? "All done — you're a star! 🌟"
    : overdue
    ? "Eek, something's overdue!"
    : active.length
    ? `${active.length} thing${active.length > 1 ? "s" : ""} to conquer 💪`
    : "Add your first assignment!";
 
  const visible = tasks
    .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
 
  // ---- tutor call ----
  const ask = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system:
            "You are Stella, a warm, cheerful astronomy tutor for an astronomy major at San Diego State University (SDSU). You help across intro astronomy, astrophysics, planetary science, stellar evolution, cosmology, observational astronomy, and the supporting physics and math. Guide the student toward understanding: explain the concept and the method, give a worked example or a guiding question, and encourage them to take the next step themselves rather than just handing over final numeric answers to graded problems. Use clear analogies. Keep a gentle, kawaii, encouraging personality with the occasional ✨ or 🌙, but stay scientifically accurate and precise. Keep replies concise (a few short paragraphs) unless asked to go deep. Use simple markdown-free plain text; write equations in readable inline form.",
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: text || "Hmm, my telescope fogged up — try asking that again? 🌙" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oh no, I couldn't reach the stars just now (connection hiccup). Give it another try in a sec! ✨" },
      ]);
    } finally {
      setThinking(false);
    }
  };
 
  // =====================================================================
  return (
    <div style={{ fontFamily: FONT_STACK, color: C.plum }} className="wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .wrap {
          min-height: 100%;
          background:
            radial-gradient(1200px 500px at 50% -10%, ${C.lilac}55, transparent),
            linear-gradient(180deg, ${C.blush}, #FFF7FB);
          position: relative; overflow: hidden;
          padding: 22px 16px 40px;
        }
        .display { font-family: 'Baloo 2', ${FONT_STACK}; }
        .starfield { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .bg-star { position: absolute; opacity: .5; animation: twinkle 4s ease-in-out infinite; }
        @keyframes twinkle { 0%,100%{opacity:.15; transform:scale(.7)} 50%{opacity:.75; transform:scale(1.1)} }
        .stella-bob { animation: bob 3.4s ease-in-out infinite; transform-origin: center; }
        @keyframes bob { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
        .content { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .card {
          background: ${C.cream};
          border: 2.5px solid ${C.pink};
          border-radius: 26px;
          box-shadow: 0 10px 0 ${C.pink}33, 0 18px 34px ${C.pink}2e;
        }
        .btn { cursor: pointer; border: none; font-family: inherit; font-weight: 700; transition: transform .12s ease, filter .12s ease; }
        .btn:hover { transform: translateY(-2px); filter: brightness(1.03); }
        .btn:active { transform: translateY(0); }
        .btn:focus-visible, input:focus-visible, textarea:focus-visible, .chip:focus-visible {
          outline: 3px solid ${C.berry}; outline-offset: 2px;
        }
        input, textarea {
          font-family: inherit; color: ${C.plum};
          border: 2px solid ${C.pink}88; background: #fff;
          border-radius: 16px; padding: 11px 14px; font-size: 15px; width: 100%;
        }
        input::placeholder, textarea::placeholder { color: ${C.pink}; }
        .chip {
          cursor: pointer; border: 2px solid ${C.pink}88; background:#fff;
          color:${C.berry}; border-radius: 999px; padding: 5px 12px; font-size: 12.5px;
          font-weight: 700; font-family: inherit; transition: all .12s ease;
        }
        .chip:hover { background: ${C.blush}; }
        .chip.on { background: ${C.pink}; color:#fff; border-color:${C.pink}; }
        .seg { display:flex; gap:6px; background:${C.blush}; border:2px solid ${C.pink}66; padding:5px; border-radius:18px; }
        .seg button {
          flex:1; border:none; background:transparent; font-family:inherit; font-weight:800;
          color:${C.berry}; padding:9px; border-radius:13px; cursor:pointer; font-size:14px;
          display:flex; align-items:center; justify-content:center; gap:6px; transition: all .15s;
        }
        .seg button.on { background:#fff; color:${C.hotpink}; box-shadow:0 4px 10px ${C.pink}3a; }
        .task { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:18px; background:#fff; border:2px solid ${C.pink}44; margin-bottom:10px; animation: pop .25s ease; }
        @keyframes pop { from{transform:scale(.96); opacity:0} to{transform:scale(1); opacity:1} }
        .task.done { background: ${C.mint}55; border-color:${C.mint}; }
        .box { width:26px; height:26px; border-radius:9px; border:2.5px solid ${C.pink}; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; flex:0 0 auto; }
        .box.on { background:${C.hotpink}; border-color:${C.hotpink}; }
        .pill { font-size:11px; font-weight:800; padding:3px 9px; border-radius:999px; white-space:nowrap; }
        .msg { max-width:82%; padding:11px 14px; border-radius:18px; font-size:14.5px; line-height:1.5; white-space:pre-wrap; word-wrap:break-word; }
        .msg.you { background:${C.pink}; color:#fff; border-bottom-right-radius:6px; }
        .msg.her { background:${C.blush}; color:${C.plum}; border:2px solid ${C.pink}44; border-bottom-left-radius:6px; }
        .progress { height:14px; background:${C.blush}; border-radius:999px; overflow:hidden; border:2px solid ${C.pink}55; }
        .progress > i { display:block; height:100%; background:linear-gradient(90deg, ${C.pink}, ${C.hotpink}); transition:width .4s ease; }
        @media (prefers-reduced-motion: reduce) {
          .stella-bob, .bg-star { animation: none !important; }
          .btn { transition: none; }
        }
      `}</style>
 
      <StarField />
 
      <div className="content">
        {/* header */}
        <div className="card" style={{ padding: "18px 20px", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <Stella mood={mascotMood} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 26, fontWeight: 800, color: C.hotpink, lineHeight: 1.05 }}>
              Stella&apos;s Study Nook
            </div>
            <div style={{ fontSize: 13, color: C.berry, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <GraduationCap size={15} /> SDSU Astronomy · homework + tutor
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{headline}</div>
            <div className="progress" title={`${doneCount} of ${tasks.length} done`}>
              <i style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
 
        {/* tabs */}
        <div className="seg" style={{ marginBottom: 16 }}>
          <button className={tab === "hw" ? "on" : ""} onClick={() => setTab("hw")}>
            <BookHeart size={17} /> Homework
          </button>
          <button className={tab === "tutor" ? "on" : ""} onClick={() => setTab("tutor")}>
            <Sparkles size={17} /> Ask Stella
          </button>
        </div>
 
        {tab === "hw" ? (
          <>
            {/* add form */}
            <div className="card" style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="✏️  Assignment name (e.g. Problem Set 4)"
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    style={{ flex: "2 1 160px" }}
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="📚  Course"
                  />
                  <input
                    style={{ flex: "1 1 140px" }}
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COURSE_CHIPS.map((c) => (
                    <button key={c} className={`chip ${course === c ? "on" : ""}`} onClick={() => setCourse(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  className="btn"
                  onClick={addTask}
                  style={{ background: C.hotpink, color: "#fff", borderRadius: 16, padding: "12px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 2 }}
                >
                  <Plus size={18} /> Add to my list
                </button>
              </div>
            </div>
 
            {/* filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
              {[["active", "To do"], ["done", "Done"], ["all", "All"]].map(([k, label]) => (
                <button key={k} className={`chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
                  {label}
                </button>
              ))}
            </div>
 
            {/* list */}
            <div className="card" style={{ padding: 16 }}>
              {visible.length === 0 ? (
                <div style={{ textAlign: "center", padding: "26px 10px", color: C.berry }}>
                  <Moon size={34} color={C.pink} />
                  <div style={{ fontWeight: 800, marginTop: 8, fontSize: 15 }}>
                    {filter === "done" ? "Nothing finished yet — you got this! 🌸" : "All clear! Your sky is calm ✨"}
                  </div>
                </div>
              ) : (
                visible.map((t) => {
                  const m = dueMeta(t.due);
                  const tone =
                    m.tone === "over" ? { background: C.berry, color: "#fff" }
                    : m.tone === "soon" ? { background: C.gold, color: C.plum }
                    : m.tone === "ok" ? { background: C.lilac, color: C.plum }
                    : { background: C.blush, color: C.berry };
                  return (
                    <div key={t.id} className={`task ${t.done ? "done" : ""}`}>
                      <div className={`box ${t.done ? "on" : ""}`} onClick={() => toggle(t.id)} role="checkbox" aria-checked={t.done} tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(t.id))}>
                        {t.done && <Check size={16} color="#fff" strokeWidth={3.5} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.6 : 1 }}>
                          {t.title}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                          {t.course && (
                            <span style={{ fontSize: 12, color: C.berry, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                              <BookHeart size={12} /> {t.course}
                            </span>
                          )}
                          {t.due && !t.done && (
                            <span className="pill" style={tone}>
                              <CalendarHeart size={11} style={{ verticalAlign: -1, marginRight: 2 }} />
                              {m.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="btn" onClick={() => remove(t.id)} aria-label="Delete"
                        style={{ background: "transparent", color: C.pink, padding: 6, borderRadius: 10 }}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          // ---- TUTOR ----
          <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 520 }}>
            <div style={{ padding: "12px 16px", background: C.blush, borderBottom: `2px solid ${C.pink}44`, display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={16} color={C.gold} fill={C.gold} />
              <span className="display" style={{ fontWeight: 800, color: C.hotpink }}>Ask Stella</span>
              <span style={{ fontSize: 12, color: C.berry, fontWeight: 600 }}>· your astro study buddy</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                  {m.role === "assistant" && <Stella mood="chill" size={34} />}
                  <div className={`msg ${m.role === "user" ? "you" : "her"}`}>{m.content}</div>
                </div>
              ))}
              {thinking && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.berry, fontWeight: 700, fontSize: 13 }}>
                  <Loader2 size={16} className="btn" style={{ animation: "spin 1s linear infinite" }} />
                  Stella&apos;s thinking...
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: 12, borderTop: `2px solid ${C.pink}44`, background: "#fff", display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
                placeholder="Ask about a concept, a problem, an equation…"
                style={{ resize: "none", maxHeight: 100 }}
              />
              <button className="btn" onClick={ask} disabled={thinking} aria-label="Send"
                style={{ background: C.hotpink, color: "#fff", borderRadius: 14, padding: "11px 13px", opacity: thinking ? 0.6 : 1 }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
 
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: C.pink, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <Sparkles size={13} /> made with love for a future astronomer <Sparkles size={13} />
        </div>
      </div>
    </div>
  );
}