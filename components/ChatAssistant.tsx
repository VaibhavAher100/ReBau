import React, { useState, useEffect, useRef } from 'react';
import { MaterialItem } from '../types';

interface ChatAssistantProps {
  inventory: MaterialItem[];
  onAddToCart: (item: MaterialItem) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  item?: MaterialItem;
}

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ inventory, onAddToCart, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hi! I can help you find materials or add them to your cart. What are you looking for?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const inventoryContext = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    condition: item.condition,
    price: item.estimatedValue,
    quantity: item.quantity,
    location: item.location
  }));

  const systemPrompt = `You are ReBau's helpful marketplace assistant.
You have access to the current site inventory: ${JSON.stringify(inventoryContext)}.
Answer questions about availability, price, and condition.
If the user asks for items (e.g., "Do you have bricks?"), search your context and reply with the item id formatted as [ADD_ITEM:id] to show it, or [CART_ITEM:id] to add it to cart.
Keep responses concise and friendly.`;

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_XAI_API_KEY;

    if (!apiKey) {
      // Mock response when no key
      await new Promise(resolve => setTimeout(resolve, 800));
      const lower = inputText.toLowerCase();
      const matched = inventory.find(i =>
        i.name.toLowerCase().includes(lower) ||
        i.category.toLowerCase().includes(lower)
      );
      const reply = matched
        ? `I found ${matched.name} in ${matched.location} for €${matched.estimatedValue}. Want to add it to your cart?`
        : "I couldn't find an exact match. Try searching by material type like 'brick', 'wood', or 'metal'.";
      setMessages(prev => [
        ...prev,
        ...(matched ? [{ id: Date.now().toString() + 'show', role: 'model' as const, text: `Here's what I found:`, item: matched }] : []),
        { id: Date.now().toString() + 'ai', role: 'model' as const, text: reply }
      ]);
      setIsLoading(false);
      return;
    }

    const history = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));

    try {
      const response = await fetch(XAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_XAI_MODEL || 'grok-2-1212',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: inputText }
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      });

      if (!response.ok) throw new Error(`xAI error: ${response.status}`);
      const data = await response.json();
      const text: string = data.choices?.[0]?.message?.content ?? '';

      // Parse [ADD_ITEM:id] and [CART_ITEM:id] tokens
      const showMatch = text.match(/\[ADD_ITEM:([^\]]+)\]/);
      const cartMatch = text.match(/\[CART_ITEM:([^\]]+)\]/);

      const cleanText = text.replace(/\[(ADD_ITEM|CART_ITEM):[^\]]+\]/g, '').trim();

      if (showMatch) {
        const item = inventory.find(i => i.id === showMatch[1]);
        if (item) {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'show',
            role: 'model',
            text: `Here's ${item.name}:`,
            item
          }]);
        }
      }

      if (cartMatch) {
        const item = inventory.find(i => i.id === cartMatch[1]);
        if (item) {
          onAddToCart(item);
          setMessages(prev => [...prev, {
            id: Date.now().toString() + 'sys',
            role: 'system',
            text: `Added ${item.name} to cart`,
            item
          }]);
        }
      }

      if (cleanText) {
        setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', role: 'model', text: cleanText }]);
      }
    } catch (error) {
      console.error('Chat Error', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-slide-up md:max-w-md md:right-0 md:left-auto md:shadow-2xl">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div>
             <h3 className="font-bold text-lg leading-none">ReBau Assistant</h3>
             <span className="text-xs text-gray-400">AI Powered</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
               <div key={msg.id} className="flex flex-col items-center my-4 space-y-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {msg.text}
                  </span>
                  {msg.item && (
                      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                          <img src={msg.item.imageUrl} alt={msg.item.name} className="w-16 h-16 object-cover rounded-lg" />
                      </div>
                  )}
               </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-orange-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>

              {!isUser && msg.item && (
                  <div className="mt-2 ml-1 max-w-[220px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                      <div className="h-28 w-full bg-gray-100">
                          <img src={msg.item.imageUrl} alt={msg.item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{msg.item.name}</h4>
                          <div className="flex justify-between items-center mt-1 mb-2">
                                <span className="text-orange-600 font-bold text-xs">€{msg.item.estimatedValue}</span>
                                <span className="text-gray-400 text-[10px]">{msg.item.condition}</span>
                          </div>
                          <button
                             onClick={() => onAddToCart(msg.item!)}
                             className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                             Add to Cart
                          </button>
                      </div>
                  </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about materials..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
