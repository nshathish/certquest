import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        const tag = input.trim().replace(/\s+/g, '-');
        setTags([...tags, tag]);
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="w-full mt-4">
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <p className="text-sm text-gray-500 mb-2">
        Add up to 5 tags to describe the image.
      </p>
      <div className="flex flex-wrap gap-2 border border-blue-400 rounded-xl px-2 py-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-gray-100 rounded px-2 py-1 text-sm font-semibold"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-gray-600 hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-grow min-w-[120px] px-2 py-1 focus:outline-none"
          {...(tags.length < 5
            ? { placeholder: 'Type a tag and press Enter' }
            : {})}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= 5}
        />
      </div>
    </div>
  );
}
