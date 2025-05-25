
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import classNames from "clsx";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recent, setRecent] = useLocalStorage<string[]>("recentSearches", []);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full max-w-xl mx-auto mt-6 mb-4 relative z-20">
      <form
        onSubmit={handleSubmit}
        className="flex items-center relative bg-neutral-800 rounded-full"
      >
        <span className="px-3 text-white">
          <Search />
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
          className="flex-1 bg-transparent text-white placeholder-gray-400 py-3 px-2 rounded-full outline-none text-base"
          placeholder="Search videos or music..."
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="rounded-full bg-neutral-700 text-white px-2 py-1 mx-1 mr-0 hover:bg-neutral-600"
            aria-label="Clear"
          >
            ×
          </button>
        )}
        <button
          className={classNames(
            "ml-2 mr-2 px-7 py-2 rounded-full font-semibold transition-colors",
            "bg-red-600 hover:bg-red-700 text-white"
          )}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {(showDropdown && recent.length > 0) && (
        <div className="absolute left-0 right-0 top-14 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-3xl p-2 animate-fade-in z-30">
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
  );
}
