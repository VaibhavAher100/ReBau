import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
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

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ inventory, onAddToCart, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hi! I can help you find materials or add them to your cart. What are you looking for?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Chat Session
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Simplified inventory for the AI context to save tokens
        const inventoryContext = inventory.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          condition: item.condition,
          price: item.estimatedValue,
          quantity: item.quantity,
          location: item.location
        }));

        const addToCartTool: FunctionDeclaration = {
          name: "addToCart",
          description: "Add an item to the user's shopping cart. Use this when the user explicitly confirms they want to buy or add an item.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              itemId: {
                type: Type.STRING,
                description: "The ID of the material item to add."
              }
            },
            required: ["itemId"]
          }
        };

        const showItemTool: FunctionDeclaration = {
            name: "showItem",
            description: "Show the image and details of a specific material item to the user. Use this when you find items relevant to the user's search.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                itemId: {
                  type: Type.STRING,
                  description: "The ID of the material item to show."
                }
              },
              required: ["itemId"]
            }
          };

        chatSessionRef.current = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: `You are BauBay's helpful marketplace assistant. 
            You have access to the current site inventory: ${JSON.stringify(inventoryContext)}.
            Answer questions about availability, price, and condition.
            If the user asks for items (e.g., "Do you have bricks?"), search your context and use the 'showItem' tool to display the best matches.
            If a user wants to buy something, use the 'addToCart' tool.
            Keep responses concise and friendly.`,
            tools: [{ functionDeclarations: [addToCartTool, showItemTool] }],
          }
        });
      } catch (error) {
        console.error("Failed to init chat", error);
      }
    };

    initChat();
  }, [inventory]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      // Handle Function Calls (Tool Use)
      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of functionCalls) {
          if (call.name === "addToCart") {
             const args = call.args as any;
             const item = inventory.find(i => i.id === args.itemId);
             
             let result = "Item not found";
             if (item) {
               onAddToCart(item);
               result = "Item added to cart successfully";
               // Add a system message to UI
               setMessages(prev => [...prev, { 
                 id: Date.now().toString() + 'sys', 
                 role: 'system', 
                 text: `Added ${item.name} to cart`,
                 item: item 
               }]);
             }

             functionResponses.push({
               name: call.name,
               response: { result: result },
               id: call.id 
             });
          } else if (call.name === "showItem") {
            const args = call.args as any;
            const item = inventory.find(i => i.id === args.itemId);
            let result = "Item not found";
            
            if (item) {
                // We don't necessarily need a text response from the model if it's just showing an item,
                // but usually the model wraps it in text.
                // We'll insert a "model" message that contains the item for rendering.
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'show',
                    role: 'model',
                    text: `I found this ${item.name} in ${item.location}:`,
                    item: item
                }]);
                result = "Item displayed to user";
            }
            
            functionResponses.push({
                name: call.name,
                response: { result: result },
                id: call.id
            });
          }
        }
        
        // Send tool execution result back to model to get final text response (if any)
        response = await chatSessionRef.current.sendMessage(functionResponses);
      }

      const modelText = response.text;
      if (modelText) {
          setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', role: 'model', text: modelText }]);
      }

    } catch (error) {
      console.error("Chat Error", error);
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
             <h3 className="font-bold text-lg leading-none">BauBay Assistant</h3>
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
              
              {/* Item Card Rendering */}
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