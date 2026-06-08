import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchTemplate } from "@vector-pokeapi/shared-types";
import { motion, AnimatePresence } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isSearching?: boolean;
  templates: SearchTemplate[];
  onTemplateSelect: (template: SearchTemplate) => void;
  activeTemplateId: number | null;
  onFilterToggle: () => void;
  hasActiveFilters: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  isSearching,
  templates,
  onTemplateSelect,
  activeTemplateId,
  onFilterToggle,
  hasActiveFilters,
}: SearchInputProps) {
  const t = useTranslations("SearchPage");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => setShowDropdown(true);

  // Filter templates based on current input text, excluding active one
  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const searchTerm = value.trim();
  const filteredTemplates = templates.filter((t) => {
    if (t.id === activeTemplateId) return false;
    if (activeTemplateId !== null) return true;
    if (searchTerm === '') return true;
    return normalize(t.queryText).includes(normalize(searchTerm));
  });

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  return (
    <div className="relative flex-grow" ref={dropdownRef}>
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
        <Search size={18} className={isSearching ? "animate-pulse text-cyan-400" : ""} />
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        placeholder={placeholder || t("searchPlaceholder")}
        className="w-full pl-11 pr-14 py-3.5 rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-md text-white placeholder-zinc-500 text-sm font-medium focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 shadow-inner transition-all"
      />

      <button
        type="button"
        onClick={onFilterToggle}
        className={`absolute inset-y-0 right-1 my-1 px-3 flex items-center justify-center rounded-lg transition-all ${hasActiveFilters ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
        title={t("filtersButton")}
      >
        <SlidersHorizontal size={16} />
      </button>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (filteredTemplates.length > 0 || activeTemplate) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="z-100 absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto"
          >
            {activeTemplate && (
              <div
                className="px-4 py-2 bg-cyan-500/10 border-b border-white/5 cursor-pointer flex items-center gap-2 hover:bg-cyan-500/20 transition-colors"
                onClick={() => {
                  onTemplateSelect(activeTemplate);
                  setShowDropdown(false);
                }}
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">{activeTemplate.queryText}</span>
                <span className="ml-auto text-xs text-cyan-500 uppercase">Activo</span>
              </div>
            )}
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="px-4 py-2 hover:bg-white/5 cursor-pointer flex flex-col justify-center transition-colors"
                onClick={() => {
                  onTemplateSelect(template);
                  setShowDropdown(false);
                }}
              >
                <span className="text-zinc-200 text-sm">{template.queryText}</span>
                <span className="text-[10px] text-zinc-500 uppercase">{template.category}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
