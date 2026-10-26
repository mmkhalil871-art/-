import React from 'react';
import { Search, X, LayoutGrid, List, Star, Filter } from 'lucide-react';
import { CATEGORIES, STATUS_LIST } from '../data/seedDecisions';
import { DecisionStatus, ViewMode } from '../types/decision';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedYear: string;
  onYearChange: (val: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
  onResetFilters: () => void;
  isFilterActive: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  showOnlyFavorites,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  totalFiltered,
  onResetFilters,
  isFilterActive,
}) => {
  return (
    <div className="bg-white border-b border-stone-200 py-4 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Top search & quick controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث برقم القرار، عنوانه، نص مادة معينة، أو رقم مادة بقانون العمل (مثال: السلامة، المادة 14، الأجور)..."
              className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 hover:text-stone-600"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick buttons: Favorites & View Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleFavorites}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-stone-400'
                }`}
              />
              <span>المفضلة</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="عرض شبكي للقرارات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="عرض جدولي مفصل"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary filters row: Category, Status, Year, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">التصنيف:</span>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-md py-1 px-2.5 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-md">
              <span className="text-stone-500 px-1.5 font-medium">الحالة:</span>
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(st)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">السنة:</span>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-md py-1 px-2 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="الكل">كل السنوات</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-stone-500 hover:text-red-700 underline cursor-pointer mr-2"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          {/* Results count text (clean metadata, no pill badge) */}
          <div className="text-stone-500">
            <span>عدد النتائج: </span>
            <span className="font-mono tabular-nums font-semibold text-stone-900">
              {totalFiltered}
            </span>
            <span> قرار وزاري</span>
          </div>
        </div>
      </div>
    </div>
  );
};
