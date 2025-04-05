import React from 'react';
import { MessageCircle } from 'lucide-react';

const PageTitle = () => {
  return (
    <div className="p-4 flex items-center justify-between w-full">
      <h1 className="text-2xl font-archivo text-orange-500">Jippy</h1>
      <a 
        href="/chatting"
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go to chat"
      >
        <MessageCircle className="w-6 h-6 text-gray-600" />
      </a>
    </div>
  );
};

export default PageTitle;