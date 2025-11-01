import { useState, useRef, useEffect } from "react";

import { TypingIndicator } from "renderer/components";

const { App } = window;

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatBoxProps {
  selectedModel: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedModel }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);
  const prevModelRef = useRef<string | null>(null);

  // Cancel and reset chat when model changes
  useEffect(() => {
    if (prevModelRef.current && prevModelRef.current !== selectedModel) {
      // Cancel active stream
      cancelRef.current = true;

      // Reset chat UI
      setMessages([]);
      setInput("");
      setLoading(false);
      setShowTyping(false);
    }
    prevModelRef.current = selectedModel;
  }, [selectedModel]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (loading || !input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    setShowTyping(true);
    cancelRef.current = false;

    let firstChunkReceived = false;
    let assistantText = "";

    try {
      await App.chat(selectedModel, [...messages, userMessage], true, (chunk: string) => {
        // Stop handling chunks if model has changed or cancelled
        if (cancelRef.current) return;

        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setShowTyping(false);
        }

        assistantText += chunk;

        setMessages((m) => {
          const lastMsg = m[m.length - 1];
          if (lastMsg?.role === "assistant") {
            const updated = [...m];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          } else {
            return [...m, { role: "assistant", content: assistantText }];
          }
        });
      });
    } catch (err) {
      if (!cancelRef.current) {
        console.error("Chat error:", err);
      }
    } finally {
      setLoading(false);
      setShowTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto p-4 bg-gray-50 rounded-xl shadow-lg">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-8 space-y-3 border border-gray-200 rounded-lg bg-white scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} relative`}>
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {showTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
      <input
        value={input}
        autoFocus
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading && selectedModel) sendMessage();
        }}
        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          selectedModel
            ? 'focus:ring-blue-400 border-gray-300'
            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        }`}
        placeholder={
          selectedModel
            ? "Type your message..."
            : "Select a model to begin chatting"
        }
        disabled={!selectedModel}
      />

      <button
        onClick={sendMessage}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!selectedModel || loading}
      >
        Send
      </button>
    </div>
    </div>
  );
};

export default ChatBox;
