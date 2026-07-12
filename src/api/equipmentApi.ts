import {Equipment, CreateEquipmentInput, UpdateEquipmentInput} from '../types/equipment'

export async function getEquipment(
  options?: { signal?: AbortSignal },
): Promise<Equipment[]> {return [];};

export async function createEquipment(
  input: CreateEquipmentInput,
): Promise<Equipment> {return {} as Equipment};

export async function updateEquipment(
  id: number,
  input: UpdateEquipmentInput,
): Promise<Equipment> {return {} as Equipment};

export async function deleteEquipment(
  id: number,
): Promise<void> {return;};
