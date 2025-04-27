import { useState, useRef, useEffect } from 'react';
import { searchUsers } from '../services/api';

const MentionInput = ({ value, onChange, placeholder, disabled }) => {
  const [mentionSearch, setMentionSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (mentionSearch.length > 0) {
        try {
          const users = await searchUsers(mentionSearch);
          setSuggestions(users);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error loading user suggestions:', error);
        }
      }
    };

    loadSuggestions();
  }, [mentionSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
      if (lastSpaceIndex < lastAtIndex) {
        const searchTerm = textBeforeCursor.substring(lastAtIndex + 1);
        setMentionSearch(searchTerm);
      }
    } else {
      setShowSuggestions(false);
      setMentionSearch('');
    }
    
    onChange(newValue);
  };

  const insertMention = (username) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textBeforeMention = value.substring(0, lastAtIndex);
    const textAfterCursor = value.substring(cursorPosition);
    
    const newValue = `${textBeforeMention}@${username} ${textAfterCursor}`;
    onChange(newValue);
    setShowSuggestions(false);
    
    if (inputRef.current) {
      const newCursorPos = lastAtIndex + username.length + 2;
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1"
        >
          {suggestions.map(user => (
            <div
              key={user.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => insertMention(user.username)}
            >
              <div className="font-medium">{user.username}</div>
              {user.fullName && (
                <div className="text-sm text-gray-500">{user.fullName}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
