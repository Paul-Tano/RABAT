"use client";
import { useState } from "react";
import { X, Calendar, Film, User } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    genre: string;
    year: string;
    director: string;
  }) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApplyFilters,
}: FilterModalProps) {
 
  const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [directorQuery, setDirectorQuery] = useState<string>("");

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      genre: selectedGenre,
      year: selectedYear,
      director: directorQuery,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setDirectorQuery("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Film className="text-red-500" size={20} /> Filtres de recherche
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Genre
            </label>
            <input
              type="text"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              placeholder="Ex: Action, Comédie, Thriller..."
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Calendar size={14} /> Année de sortie
            </span>
            <div className="flex flex-wrap gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() =>
                    setSelectedYear(selectedYear === year ? "" : year)
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                    selectedYear === year
                      ? "bg-amber-500 border-amber-400 text-black font-bold"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="director"
              className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1"
            >
              <User size={14} /> Réalisateur
            </label>
            <input
              id="director"
              type="text"
              value={directorQuery}
              onChange={(e) => setDirectorQuery(e.target.value)}
              placeholder="Ex: Christopher Nolan, Denis Villeneuve..."
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Réinitialiser tout
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-red-950/40 cursor-pointer"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
