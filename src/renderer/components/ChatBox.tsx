import { useState, useRef, useEffect } from "react";
import { ChatResponse } from "preload/api/ollama";

const { App } = window;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Animated dots component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 h-6">
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
  </div>
);

const ChatBox = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setLoading(true);
    setShowTyping(true);
    cancelRef.current = false;

    let firstChunkReceived = false;
    let assistantText = '';

    try {
      await App.chat(
        "tinyllama",
        [...messages, userMessage],
        true,
        (chunk: string) => {
          if (cancelRef.current) return;

          // Hide typing indicator as soon as first chunk arrives
          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setShowTyping(false);
          }

          assistantText += chunk;

          setMessages((m) => {
            const lastMsg = m[m.length - 1];
            if (lastMsg?.role === 'assistant') {
              const updated = [...m];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText };
              return updated;
            } else {
              return [...m, { role: 'assistant', content: assistantText }];
            }
          });
        }
      );
    } catch (err) {
      console.error(err);
      setShowTyping(false);
    } finally {
      setLoading(false);
      setShowTyping(false); // ensure hidden if stream ends
    }
  };

  const stopAssistant = () => {
    cancelRef.current = true;
    setLoading(false);
    setShowTyping(false);
  };

  return (
    <div className="flex flex-col h-full w-full mx-auto p-4 bg-gray-50 rounded-xl shadow-lg">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 pb-8 space-y-3 border border-gray-200 rounded-lg bg-white scroll-smooth"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg wrap-break-words  whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator only before first chunk arrives */}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
        />

        <button
          onClick={sendMessage}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
        {/* {loading ? (
          <button
            onClick={stopAssistant}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        )} */}
      </div>
    </div>
  );
};

export default ChatBox;
