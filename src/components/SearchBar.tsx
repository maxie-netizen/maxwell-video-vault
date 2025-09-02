
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import classNames from "clsx";
import { searchYouTube } from "@/lib/youtubeApi";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recent, setRecent] = useLocalStorage<string[]>("recentSearches", []);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  let debounceTimer = useRef<any>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      const filtered = [value.trim(), ...recent.filter(r => r.toLowerCase() !== value.trim().toLowerCase())];
      setRecent(filtered.slice(0, 5));
      setShowDropdown(false);
    }
  }

  function handleClear() {
    setRecent([]);
  }

  function handleSelect(search: string) {
    setValue(search);
    onSearch(search);
    setShowDropdown(false);
  }

  // Live suggestion fetch as user types (debounced)
  async function fetchSuggestions(query: string) {
    setSuggestLoading(true);
    try {
      const response = await searchYouTube(query);
      setSuggestions(response.items || []);
    } catch {
      setSuggestions([]);
    }
    setSuggestLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    setShowDropdown(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (val.trim().length > 1) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(val.trim());
      }, 350);
    } else {
      setSuggestions([]);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 mb-3 relative z-20">
      <form
        onSubmit={handleSubmit}
        className="flex items-center relative bg-neutral-800 rounded-full"
      >
        <span className="px-2 text-white">
          <Search size={16} />
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
          className="flex-1 bg-transparent text-white placeholder-gray-400 py-2 px-1 rounded-full outline-none text-sm"
          placeholder="Search videos..."
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="rounded-full bg-neutral-700 text-white px-1.5 py-0.5 mx-1 mr-0 hover:bg-neutral-600 text-sm"
            aria-label="Clear"
          >
            ×
          </button>
        )}
        <button
          className={classNames(
            "ml-1 mr-1 px-3 py-1.5 rounded-full font-medium transition-colors text-xs",
            "bg-red-600 hover:bg-red-700 text-white"
          )}
          disabled={loading}
        >
          {loading ? "..." : "Go"}
        </button>
      </form>
      {(showDropdown && (recent.length > 0 || suggestions.length > 0)) && (
        <div className="absolute left-0 right-0 top-14 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-3xl p-2 animate-fade-in z-30">
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center px-3 pt-2 text-xs text-gray-400">
                <span>Suggestions</span>
                {suggestLoading && <span className="ml-2 animate-pulse">...</span>}
              </div>
              <ul>
                {suggestions.map((s, idx) => (
                  <li
                    key={s.id.videoId || idx}
                    className="flex items-center py-2 px-4 cursor-pointer hover:bg-neutral-800 rounded-lg transition-colors"
                    onMouseDown={() => handleSelect(s.snippet.title)}
                  >
                    <Search size={16} className="mr-2 text-gray-400" />
                    <span className="text-white line-clamp-1">{s.snippet.title}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-neutral-800 my-2" />
            </div>
          )}
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 pt-2 text-xs text-gray-400">
                <span>Recent Searches</span>
                <button className="underline" onClick={handleClear} type="button">
                  Clear all
                </button>
              </div>
              <ul>
                {recent.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center py-2 px-4 cursor-pointer hover:bg-neutral-800 rounded-lg transition-colors"
                    onMouseDown={() => handleSelect(s)}
                  >
                    <Search size={16} className="mr-2 text-gray-400" />
                    <span className="text-white">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
