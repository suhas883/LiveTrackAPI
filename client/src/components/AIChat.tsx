import { Bot, X, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(
    [{ role: 'assistant', content: 'Hi! I can help you with tracking questions, explain delays, and provide delivery estimates. How can I assist you?' }]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message || data.choices?.[0]?.message?.content || '';

      if (assistantMessage) {
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm here to help with tracking questions! Try asking about tracking numbers, delivery times, or carrier information."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col h-96 z-50">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-sm opacity-90">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your package..."
              className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition z-40 flex items-center justify-center"
        aria-label="Open AI Assistant"
        data-testid="button-ai-chat"
      >
        <Bot size={28} />
      </button>
    </>
  );
}
