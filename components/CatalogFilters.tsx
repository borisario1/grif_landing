import { landingContent } from "@/data/landing-content";

type CatalogFiltersProps = {
  colorHexMap: Record<string, string>;
  categories: string[];
  usageTypes: string[];
  colors: string[];
  selectedCategory: string;
  selectedUsageType: string;
  selectedColor: string;
  onReset: () => void;
  onCategoryChange: (value: string) => void;
  onUsageTypeChange: (value: string) => void;
  onColorChange: (value: string) => void;
};

const ALL = "all";

export function CatalogFilters({
  categories,
  usageTypes,
  colors,
  colorHexMap,
  selectedCategory,
  selectedUsageType,
  selectedColor,
  onReset,
  onCategoryChange,
  onUsageTypeChange,
  onColorChange,
}: CatalogFiltersProps) {
  const c = landingContent.catalog.filters;
  const common = landingContent.common;
  const hasActiveFilters = selectedCategory !== ALL || selectedUsageType !== ALL || selectedColor !== ALL;
  return (
    <div className="filters-panel">
      <div className="filters-head">
        <button className="filter-reset-btn" onClick={onReset} disabled={!hasActiveFilters}>
          Сбросить фильтры
        </button>
      </div>
      <div className="filter-group">
        <p className="filter-title">{c.category}</p>
        <div className="filter-buttons">
          {[ALL, ...categories].map((value) => (
            <button
              key={value}
              className={`filter-btn ${selectedCategory === value ? "active" : ""}`}
              onClick={() => onCategoryChange(value)}
            >
              {value === ALL ? common.all : value}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <p className="filter-title">{c.type}</p>
        <div className="filter-buttons">
          {[ALL, ...usageTypes].map((value) => (
            <button
              key={value}
              className={`filter-btn ${selectedUsageType === value ? "active" : ""}`}
              onClick={() => onUsageTypeChange(value)}
            >
              {value === ALL ? common.all : value}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <p className="filter-title">
          {c.color}: {selectedColor === ALL ? common.all : selectedColor}
        </p>
        <div className="color-swatches">
          <button
            className={`swatch all ${selectedColor === ALL ? "active" : ""}`}
            onClick={() => onColorChange(ALL)}
            aria-label={c.allColorsAria}
          >
            {common.all}
          </button>
          {colors.map((value) => (
            <button
              key={value}
              className={`swatch ${selectedColor === value ? "active" : ""}`}
              style={{ background: colorHexMap[value] }}
              onClick={() => onColorChange(value)}
              aria-label={value}
              title={value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
