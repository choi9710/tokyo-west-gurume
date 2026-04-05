import { WARDS, type Area } from '../../lib/constants';

interface AreaSelectorProps {
  selected: Area[];
  onChange: (areas: Area[]) => void;
}

export function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  const selectedIds = new Set(selected.map((a) => a.id));

  const toggleArea = (area: Area) => {
    onChange(selectedIds.has(area.id) ? [] : [area]);
  };

  return (
    <div className="space-y-2">
      {WARDS.map((ward) => {
        const someSelected = ward.areas.some((a) => selectedIds.has(a.id));

        return (
          <div key={ward.id} className="flex items-start gap-2">
            {/* 구역 라벨 */}
            <span
              className={`flex-shrink-0 mt-0.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                someSelected
                  ? 'bg-gray-200 text-gray-700 border-gray-400'
                  : 'bg-white text-gray-500 border-gray-300'
              }`}
            >
              {ward.name}
            </span>

            {/* 역 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {ward.areas.map((area) => {
                const isSelected = selectedIds.has(area.id);
                return (
                  <button
                    key={area.id}
                    onClick={() => toggleArea(area)}
                    aria-pressed={isSelected}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
