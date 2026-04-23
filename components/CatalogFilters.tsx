import { CatalogDisplayMode } from "@/data/products";
import { landingContent } from "@/data/landing-content";

type CatalogFiltersProps = {
  colorHexMap: Record<string, string>;
  categories: string[];
  usageTypes: string[];
  colors: string[];
  selectedCategory: string;
  selectedUsageType: string;
  selectedColor: string;
  displayMode: CatalogDisplayMode;
  showDisplayModeToggle: boolean;
  onCategoryChange: (value: string) => void;
  onUsageTypeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onDisplayModeChange: (value: CatalogDisplayMode) => void;
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
  displayMode,
  showDisplayModeToggle,
  onCategoryChange,
  onUsageTypeChange,
  onColorChange,
  onDisplayModeChange,
}: CatalogFiltersProps) {
  const c = landingContent.catalog.filters;
  const common = landingContent.common;
  return (
    <div className="filters-panel">
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
      {showDisplayModeToggle && (
        <div className="filter-group">
          <p className="filter-title">{c.displayMode}</p>
          <div className="filter-buttons">
            <button className={`filter-btn ${displayMode === "more_info" ? "active" : ""}`} onClick={() => onDisplayModeChange("more_info")}>
              {c.moreInfo}
            </button>
            <button className={`filter-btn ${displayMode === "more_goods" ? "active" : ""}`} onClick={() => onDisplayModeChange("more_goods")}>
              {c.moreProduct}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
