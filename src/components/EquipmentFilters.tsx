import {
  EQUIPMENT_CATEGORY_SELECT,
  EQUIPMENT_STATUS_SELECT,
  type CategoryFilter,
  type StatusFilter,
} from '../types/equipment';

import type {
  ChangeEvent,
} from 'react';

type EquipmentFilterProps = {
  searchText: string;
  selectedStatus: StatusFilter;
  selectedCategory: CategoryFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
};

function isStatusFilter(
  value: string,
): value is StatusFilter {
  return EQUIPMENT_STATUS_SELECT.some(
    status => status === value,
  );
}

function isCategoryFilter(
  value: string,
): value is CategoryFilter {
  return EQUIPMENT_CATEGORY_SELECT.some(
    category => category === value,
  );
}

export function EquipmentFilters({
  searchText,
  selectedStatus,
  selectedCategory,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: EquipmentFilterProps) {
  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    onSearchChange(event.currentTarget.value);
  };

  const handleStatusChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value = event.currentTarget.value;

    if (isStatusFilter(value)) {
      onStatusChange(value);
    }
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value = event.currentTarget.value;

    if (isCategoryFilter(value)) {
      onCategoryChange(value);
    }
  };

  return (
    <div>
      <label htmlFor="equipment-search">
        Поиск
      </label>
      <input
        id="equipment-search"
        type="search"
        value={searchText}
        onChange={handleSearchChange}
      />

      <label htmlFor="equipment-category">
        Категория
      </label>
      <select
        id="equipment-category"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        {EQUIPMENT_CATEGORY_SELECT.map(category => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
      </select>

      <label htmlFor="equipment-status">
        Статус
      </label>
      <select
        id="equipment-status"
        value={selectedStatus}
        onChange={handleStatusChange}
      >
        {EQUIPMENT_STATUS_SELECT.map(status => (
          <option
            key={status}
            value={status}
          >
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}