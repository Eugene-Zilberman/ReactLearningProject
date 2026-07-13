export const EQUIPMENT_STATUSES = [
  'available',
  'in-use',
  'maintenance',
] as const;

export const EQUIPMENT_STATUS_SELECT = [...EQUIPMENT_STATUSES, 'all'] as const;

export type EquipmentStatus =
  (typeof EQUIPMENT_STATUSES)[number];

export const EQUIPMENT_CATEGORIES = [
  'microscope',
  'centrifuge',
  'analyzer',
  'other',
] as const;

export const EQUIPMENT_CATEGORY_SELECT = [...EQUIPMENT_CATEGORIES, 'all'] as const;

export type EquipmentCategory =
  (typeof EQUIPMENT_CATEGORIES)[number];

export type Equipment = {
  id: number;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  room: string;
  lastCalibrationDate: string | null;
};

export type CreateEquipmentInput =
  Omit<Equipment, 'id'>;

export type UpdateEquipmentInput =
  Partial<Omit<Equipment, 'id'>>;


export type EquipmentRequestState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; equipment: Equipment[] };

export type StatusFilter = 'all' | EquipmentStatus;
export type CategoryFilter = 'all' | EquipmentCategory;


