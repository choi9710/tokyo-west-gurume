import { WARDS, type Area } from '../../lib/constants';

interface AreaSelectorProps {
  selected: Area[];
  onChange: (areas: Area[]) => void;
}

export function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  const selectedIds = new Set(selected.map((a) => a.id));

  const toggleArea = (area: Area) => {
    if (selectedIds.has(area.id)) {
      onChange(selected.filter((a) => a.id !== area.id));
    } else {
      onChange([...selected, area]);
    }
  };

  const toggleWard = (wardAreas: Area[]) => {
    const allSelected = wardAreas.every((a) => selectedIds.has(a.id));
    if (allSelected) {
      // 전체 해제
      const wardIds = new Set(wardAreas.map((a) => a.id));
      onChange(selected.filter((a) => !wardIds.has(a.id)));
    } else {
      // 미선택 역만 추가
      const toAdd = wardAreas.filter((a) => !selectedIds.has(a.id));
      onChange([...selected, ...toAdd]);
    }
  };

  return (
    <div className="space-y-2">
      {WARDS.map((ward) => {
        const allSelected = ward.areas.every((a) => selectedIds.has(a.id));
        const someSelected = ward.areas.some((a) => selectedIds.has(a.id));

        return (
          <div key={ward.id} className="flex items-start gap-2">
            {/* 구역 라벨 (클릭 시 전체 선택/해제) */}
            <button
              onClick={() => toggleWard(ward.areas)}
              aria-pressed={allSelected}
              className={`flex-shrink-0 mt-0.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                allSelected
                  ? 'bg-gray-700 text-white border-gray-700'
                  : someSelected
                  ? 'bg-gray-200 text-gray-700 border-gray-400'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'
              }`}
            >
              {ward.name}
            </button>

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
