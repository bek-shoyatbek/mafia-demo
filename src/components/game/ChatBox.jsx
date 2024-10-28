import React, { useState, useRef, useEffect } from "react";
import { useGame } from "../../hooks/useGame";
import { useAuth } from "../../hooks/useAuth";
import { GAME_PHASES } from "../../constants";

export function ChatBox() {
  const [message, setMessage] = useState("");
  const { state, addMessage } = useGame();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    addMessage({
      id: Date.now(),
      sender: user.username,
      content: message,
      timestamp: new Date().toISOString(),
      isGameEvent: false,
    });

    setMessage("");
  };

  const canChat =
    state.phase !== GAME_PHASES.NIGHT_ACTION ||
    state.players[user.id]?.state === "DEAD";

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {state.messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.isGameEvent ? "bg-blue-900 text-blue-100" : "bg-gray-700"
            }`}
          >
            {!msg.isGameEvent && (
              <span className="font-bold text-blue-400">{msg.sender}: </span>
            )}
            <span>{msg.content}</span>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!canChat}
          placeholder={
            canChat
              ? "Type your message..."
              : "Chat disabled during night phase"
          }
          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 disabled:opacity-50"
        />
      </form>
    </div>
  );
}
