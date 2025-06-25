import React, { useState } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';

interface TextQueryInputProps {
  onQuery: (query: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
}

const TextQueryInput: React.FC<TextQueryInputProps> = ({
  onQuery,
  isLoading = false,
  placeholder = "Ask about team metrics... (e.g., 'Show velocity for last 3 months')"
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      await onQuery(query.trim());
      setQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
      
      {/* Example queries */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Try:</span>
        {[
          "Show velocity trends for Q1",
          "Bug rate comparison last 6 months",
          "Team resolution time by priority"
        ].map((example, index) => (
          <button
            key={index}
            onClick={() => setQuery(example)}
            disabled={isLoading}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            "{example}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default TextQueryInput;