import { regions } from "../data/regions";
import type { RegionKey } from "../types";

type RegionSelectorProps = {
  selectedRegion: RegionKey;
  onChange: (region: RegionKey) => void;
};

function RegionSelector({ selectedRegion, onChange }: RegionSelectorProps) {
  return (
    <div className="panel">
      <label htmlFor="region-select">Select Region</label>
      <select
        id="region-select"
        value={selectedRegion}
        onChange={(e) => onChange(e.target.value as RegionKey)}
      >
        {regions.map((region) => (
          <option key={region.value} value={region.value}>
            {region.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RegionSelector;