import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 glass p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
        placeholder="Ask about market trends..."
      />
      <button type="submit" className="glass-button p-2">
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};