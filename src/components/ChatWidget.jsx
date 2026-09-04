import { MessageCircle, Send, X } from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { answer, getOpeningMessage, hasResume, linkify, setResume } from "../lib/chatEngine";
import "./ChatWidget.css";

function firstNameOf(name) {
  return name ? name.split(" ")[0] : "kushal";
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [resumeName, setResumeName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const logRef = useRef(null);
  const inputRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    let cancelled = false;
    fetch("/resume.json")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResume(data);
        setResumeName(data.name);
        setMessages([{ role: "bot", text: getOpeningMessage() }]);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([{ role: "error", text: "Couldn't load résumé data right now." }]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy || !hasResume()) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    setTyping(true);

    const delay = 900 + Math.random() * 400;
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: answer(message) }]);
      setBusy(false);
    }, delay);
  };

  const first = firstNameOf(resumeName);

  return (
    <>
      <button
        type="button"
        className="rcb-toggle"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="rcb-toggle-dot" aria-hidden="true" />
        <MessageCircle size={16} aria-hidden="true" />
        Chat with me
      </button>

      <div id={titleId} className="rcb-panel" hidden={!open} role="dialog" aria-label={`Résumé chat with ${resumeName || "me"}`}>
        <div className="rcb-titlebar">
          <span className="rcb-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="rcb-title">zsh — {resumeName || "..."} (résumé bot)</span>
          <button type="button" className="rcb-close" aria-label="Close chat" onClick={() => setOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="rcb-log" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} className={`rcb-msg ${m.role}`}>
              <span className="rcb-prompt">
                {m.role === "user" ? "you$" : m.role === "error" ? "!!" : `${first}$`}
              </span>
              {m.role === "bot" ? (
                <span className="rcb-text" dangerouslySetInnerHTML={{ __html: linkify(m.text) }} />
              ) : (
                <span className="rcb-text">{m.text}</span>
              )}
            </div>
          ))}
          {typing && (
            <div className="rcb-msg bot typing">
              <span className="rcb-prompt">{first}$</span>
              <span className="rcb-text">
                <span className="rcb-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </span>
            </div>
          )}
        </div>

        <form className="rcb-form" onSubmit={handleSubmit}>
          <span className="rcb-form-prompt">you$</span>
          <input
            ref={inputRef}
            className="rcb-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about experience, skills, projects..."
            disabled={busy || !hasResume()}
            autoComplete="off"
          />
          <button type="submit" className="rcb-send" disabled={busy || !hasResume() || !input.trim()} aria-label="Send">
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatWidget;
