
import { Youtube } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-neutral-900 flex items-center justify-between px-4 py-3 shadow-md border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <Youtube className="text-red-600 w-8 h-8" />
        <span className="text-xl font-extrabold tracking-tight text-white">
          MAXWELL <span className="text-red-500">DOWNLOADER</span>
        </span>
      </div>
      <div className="flex gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 transition-colors">
          <svg width="22" height="22" className="text-white" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 16v-7m0 0l-4 4m4-4l4 4" /><circle cx="12" cy="12" r="10"></circle></svg>
        </button>
        <button className="bg-neutral-800 hover:bg-neutral-700 rounded-full p-2 transition-colors">
          <svg width="22" height="22" className="text-white" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="9" /><path d="M7 12v-2a4 4 0 0 1 8 0v2" /></svg>
        </button>
      </div>
    </header>
  );
};
export default Header;
