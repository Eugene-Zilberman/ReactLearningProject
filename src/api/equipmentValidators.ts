import * as e from '../types/equipment';

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  // Проверяем, является ли дата "Invalid Date" и можно ли получить время
  return !isNaN(date.getTime());
}

export function isEquipmentStatus(
  value: unknown,
): value is e.EquipmentStatus
{
    return e.EQUIPMENT_STATUSES.some(
    status => status === value,
  );
}

export function isEquipmentCategory(
  value: unknown,
): value is e.EquipmentCategory
{
    return e.EQUIPMENT_CATEGORIES.some(
    status => status === value,
  );
}

export function isEquipment(
  value: unknown,
): value is e.Equipment {
  return (
    typeof value === 'object' &&
    value !== null &&

    'id' in value &&
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&

    'name' in value &&
    typeof value.name === 'string' &&

    'status' in value &&
    isEquipmentStatus(value.status) &&

    'category' in value &&
    isEquipmentCategory(value.category) &&

    'room' in value &&
    typeof value.room === 'string' &&

    'lastCalibrationDate' in value &&
    (
      value.lastCalibrationDate === null ||
      (
        typeof value.lastCalibrationDate === 'string' &&
        isValidDate(value.lastCalibrationDate)
      )
    )
  );
}

export function isEquipmentArray(
  value: unknown,
): value is e.Equipment[]
{
    return Array.isArray(value) && value.every(isEquipment)
}