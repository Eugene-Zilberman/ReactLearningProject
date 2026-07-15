import {
  useState,
} from 'react';

import type {
  ChangeEvent,
  FormEvent,
} from 'react';

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUSES,
  type CreateEquipmentInput,
  type EquipmentCategory,
  type EquipmentStatus,
} from '../types/equipment';


type FormValues = {
  name: string;
  category: EquipmentCategory | '';
  status: EquipmentStatus | '';
  room: string;
  lastCalibrationDate: string;
};

type errorMessages = Partial<Record<keyof CreateEquipmentInput, string>>;

function isValidCalendarDate(dateString: string): boolean {
  // 1. Strict regex check for YYYY-MM-DD format
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // 2. Parse into parts
  const [year, month, day] = dateString.split('-').map(Number);

  // 3. Create Date object using UTC to avoid local timezone shifts
  // Note: JavaScript months are 0-indexed (0 = January, 11 = December)
  const date = new Date(Date.UTC(year, month - 1, day));

  // 4. Check if the date actually existed (prevents month overflow)
  // e.g., '2026-02-31' rolls over to March, so date.getUTCDate() will equal 3 instead of 31
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isStatus(
  value: string,
): value is EquipmentStatus {
  return EQUIPMENT_STATUSES.some(
    status => status === value,
  );
}

function isCategory(
  value: string,
): value is EquipmentCategory {
  return EQUIPMENT_CATEGORIES.some(
    category => category === value,
  );
}

function getFormErrors(formBody: FormValues): errorMessages {
  const errors: errorMessages = {};
  //name
  if (formBody.name.trim() === '')
    errors.name = "Mandatory field";
  else if (formBody.name.trim().length < 3)
    errors.name = "Name should be at least 3 symbols long";

  if (formBody.room.trim() === '')
    errors.room = "Mandatory field"

  if (formBody.status === '')
    errors.status = "Mandatory field";
  else if (!(isStatus(formBody.status)))
    errors.status = "Illegal status";

  if (formBody.category === '')
    errors.category = "Mandatory field";
  else if (!(isCategory(formBody.category)))
    errors.category = "Illegal category";

  errors.lastCalibrationDate = isValidCalendarDate(formBody.lastCalibrationDate)
    ? undefined : "Illegal calibration date";

  if (formBody.lastCalibrationDate === '')
    errors.lastCalibrationDate = undefined;

  return errors;
}

type EquipmentFormProps = {
  onSuccessfulSubmit: (input: CreateEquipmentInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EquipmentForm({ onSuccessfulSubmit, onCancel, isSubmitting }: EquipmentFormProps) {
  const [formState, setFormState] = useState<FormValues>({
    name: '',
    category: '',
    status: '',
    room: '',
    lastCalibrationDate: '',
  });
  const [formErrorsState, setFormErrorsState] = useState<errorMessages>({});
  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ): void {
    setFormState(current => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField('name', event.currentTarget.value);
  }

  function handleRoomChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField('room', event.currentTarget.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    updateField('status', isStatus(event.currentTarget.value) ? event.currentTarget.value : '');
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>): void {
    updateField('category', isCategory(event.currentTarget.value) ? event.currentTarget.value : '');
  }

  function handleCalibrationDateChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField('lastCalibrationDate', event.currentTarget.value);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = getFormErrors(formState);
    setFormErrorsState(errors);
    if (!Object.values(errors).every(value => value === undefined))
      return
    else
    {
      const input: CreateEquipmentInput = {
        category: formState.category as EquipmentCategory,
        status: formState.status as EquipmentStatus,
        name: formState.name.trim(),
        room: formState.room.trim(),
        lastCalibrationDate: (formState.lastCalibrationDate !== '') ? formState.lastCalibrationDate : null
      };
      onSuccessfulSubmit(input);
    }
  }
  return (
    <form onSubmit={submitForm}>
      <fieldset>
        <legend>Добавить оборудование</legend>

        <div>
          <label htmlFor="equipment-name">
            Название
          </label>

          <input
            value={formState.name}
            id="equipment-name"
            name="name"
            type="text"
            autoComplete="off"
            aria-describedby="equipment-name-error"
            onChange={handleNameChange}></input>

          <p id="equipment-name-error">
            {formErrorsState?.name}
          </p>
        </div>

        <div>
          <label htmlFor="equipment-category">
            Категория
          </label>

          <select
            value={formState.category}
            id="equipment-category"
            name="category"
            aria-describedby="equipment-category-error"
            onChange={handleCategoryChange}>
            <option value="microscope">
              Microscope
            </option>
            <option value="centrifuge">
              Centrifuge
            </option>
            <option value="analyzer">
              Analyzer
            </option>
            <option value="other">
              Other
            </option>
            <option value="">{''}</option>
          </select>

          <p id="equipment-category-error">
            {formErrorsState?.category}
          </p>
        </div>

        <div>
          <label htmlFor="equipment-status">
            Статус
          </label>

          <select
            value={formState.status}
            id="equipment-status"
            name="status"
            aria-describedby="equipment-status-error"
            onChange={handleStatusChange}>
            <option value="available">
              Available
            </option>
            <option value="in-use">
              In use
            </option>
            <option value="maintenance">
              Maintenance
            </option>
            <option value="">{''}</option>
          </select>

          <p id="equipment-status-error">
            {formErrorsState?.status}
          </p>
        </div>

        <div>
          <label htmlFor="equipment-room">
            Комната
          </label>

          <input
            value={formState.room}
            id="equipment-room"
            name="room"
            type="text"
            autoComplete="off"
            aria-describedby="equipment-room-error"
            onChange={handleRoomChange}></input>

          <p id="equipment-room-error">
            {formErrorsState?.room}
          </p>
        </div>

        <div>
          <label htmlFor="equipment-calibration-date">
            Дата последней калибровки
          </label>

          <input
            value={formState.lastCalibrationDate}
            id="equipment-calibration-date"
            name="lastCalibrationDate"
            type="date"
            aria-describedby="equipment-calibration-date-error"
            onChange={handleCalibrationDateChange}></input>

          <p id="equipment-calibration-date-error">
            {formErrorsState?.lastCalibrationDate}
          </p>
        </div>

        <div>
          <button disabled={isSubmitting === true} type="submit">
            Сохранить
          </button>

          <button onClick={onCancel} type="button">
            Отмена
          </button>
        </div>
      </fieldset>
    </form>
  );
}