import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Plus } from "lucide-react";

const SearchableSelect = ({ label, value, options, onChange, placeholder = "Select or type new..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCustomAdd = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
        {label}
      </label>
      <div
        className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded text-sm text-gray-900 dark:text-white cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              placeholder="Search or add new..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomAdd();
                }
              }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    value === opt ? "bg-blue-600/10 text-blue-600 font-medium" : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                </div>
              ))
            ) : searchTerm ? (
               <div 
                className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                onClick={handleCustomAdd}
               >
                 <Plus size={14} />
                 <span>Add "{searchTerm}"</span>
               </div>
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 italic">No industries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
