import {
  delay,
  http,
  HttpResponse,
} from 'msw';

import {
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentCategory,
  type EquipmentStatus,
  type UpdateEquipmentInput,
} from '../types/equipment';

import {
  isEquipmentCategory,
  isEquipmentStatus,
} from '../api/equipmentValidators';

const API_DELAY = 500;

type EquipmentField = keyof CreateEquipmentInput;

type ErrorField =
  | EquipmentField
  | 'body'
  | 'id';

export type FieldErrors =
  Partial<Record<ErrorField, string>>;

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      fieldErrors: FieldErrors;
    };

type JsonReadResult =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
    };

const EQUIPMENT_INPUT_FIELDS = new Set<string>([
  'name',
  'category',
  'status',
  'room',
  'lastCalibrationDate',
]);

function createInitialEquipment(): Equipment[] {
  return [
    {
      id: 1,
      name: 'Microscope A',
      category: 'microscope',
      status: 'available',
      room: '201',
      lastCalibrationDate: '2026-06-10',
    },
    {
      id: 2,
      name: 'Centrifuge B',
      category: 'centrifuge',
      status: 'maintenance',
      room: '105',
      lastCalibrationDate: null,
    },
    {
      id: 3,
      name: 'Analyzer X',
      category: 'analyzer',
      status: 'in-use',
      room: '305',
      lastCalibrationDate: '2026-07-01',
    },
  ];
}

let equipment: Equipment[] =
  createInitialEquipment();

/**
 * Пригодится позднее в тестах, потому что handlers хранят
 * массив между запросами.
 */
export function resetEquipmentMock(): void {
  equipment = createInitialEquipment();
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidDateString(
  value: string,
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date
    .toISOString()
    .slice(0, 10) === value;
}

function addUnexpectedFieldErrors(
  value: Record<string, unknown>,
  fieldErrors: FieldErrors,
): void {
  if ('id' in value) {
    fieldErrors.id =
      'Поле id нельзя передавать или изменять';
  }

  const unexpectedFields =
    Object.keys(value).filter(
      key =>
        key !== 'id' &&
        !EQUIPMENT_INPUT_FIELDS.has(key),
    );

  if (unexpectedFields.length > 0) {
    fieldErrors.body =
      `Недопустимые поля: ${unexpectedFields.join(', ')}`;
  }
}

function validateCreateEquipmentInput(
  value: unknown,
): ValidationResult<CreateEquipmentInput> {
  if (!isRecord(value)) {
    return {
      success: false,
      fieldErrors: {
        body:
          'Тело запроса должно быть JSON-объектом',
      },
    };
  }

  const fieldErrors: FieldErrors = {};

  addUnexpectedFieldErrors(
    value,
    fieldErrors,
  );

  let name: string | undefined;

  if (typeof value.name !== 'string') {
    fieldErrors.name =
      'Название обязательно и должно быть строкой';
  } else {
    const normalizedName = value.name.trim();

    if (normalizedName.length === 0) {
      fieldErrors.name =
        'Название обязательно';
    } else if (normalizedName.length < 3) {
      fieldErrors.name =
        'Название должно содержать не менее трёх символов';
    } else {
      name = normalizedName;
    }
  }

  let category:
    | EquipmentCategory
    | undefined;

  if (value.category === undefined) {
    fieldErrors.category =
      'Категория обязательна';
  } else if (
    !isEquipmentCategory(value.category)
  ) {
    fieldErrors.category =
      'Указана недопустимая категория';
  } else {
    category = value.category;
  }

  let status:
    | EquipmentStatus
    | undefined;

  if (value.status === undefined) {
    fieldErrors.status =
      'Статус обязателен';
  } else if (
    !isEquipmentStatus(value.status)
  ) {
    fieldErrors.status =
      'Указан недопустимый статус';
  } else {
    status = value.status;
  }

  let room: string | undefined;

  if (typeof value.room !== 'string') {
    fieldErrors.room =
      'Комната обязательна и должна быть строкой';
  } else {
    const normalizedRoom = value.room.trim();

    if (normalizedRoom.length === 0) {
      fieldErrors.room =
        'Комната обязательна';
    } else {
      room = normalizedRoom;
    }
  }

  let lastCalibrationDate:
    | string
    | null
    | undefined;

  if (!('lastCalibrationDate' in value)) {
    fieldErrors.lastCalibrationDate =
      'Дата должна быть строкой или null';
  } else if (
    value.lastCalibrationDate === null
  ) {
    lastCalibrationDate = null;
  } else if (
    typeof value.lastCalibrationDate !==
    'string'
  ) {
    fieldErrors.lastCalibrationDate =
      'Дата должна быть строкой или null';
  } else if (
    !isValidDateString(
      value.lastCalibrationDate,
    )
  ) {
    fieldErrors.lastCalibrationDate =
      'Дата должна быть корректной и иметь формат YYYY-MM-DD';
  } else {
    lastCalibrationDate =
      value.lastCalibrationDate;
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    name === undefined ||
    category === undefined ||
    status === undefined ||
    room === undefined ||
    lastCalibrationDate === undefined
  ) {
    return {
      success: false,
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      name,
      category,
      status,
      room,
      lastCalibrationDate,
    },
  };
}

function validateUpdateEquipmentInput(
  value: unknown,
): ValidationResult<UpdateEquipmentInput> {
  if (!isRecord(value)) {
    return {
      success: false,
      fieldErrors: {
        body:
          'Тело запроса должно быть JSON-объектом',
      },
    };
  }

  const fieldErrors: FieldErrors = {};
  const updates: UpdateEquipmentInput = {};

  addUnexpectedFieldErrors(
    value,
    fieldErrors,
  );

  if ('name' in value) {
    if (typeof value.name !== 'string') {
      fieldErrors.name =
        'Название должно быть строкой';
    } else {
      const normalizedName =
        value.name.trim();

      if (normalizedName.length === 0) {
        fieldErrors.name =
          'Название обязательно';
      } else if (
        normalizedName.length < 3
      ) {
        fieldErrors.name =
          'Название должно содержать не менее трёх символов';
      } else {
        updates.name = normalizedName;
      }
    }
  }

  if ('category' in value) {
    if (
      !isEquipmentCategory(value.category)
    ) {
      fieldErrors.category =
        'Указана недопустимая категория';
    } else {
      updates.category = value.category;
    }
  }

  if ('status' in value) {
    if (!isEquipmentStatus(value.status)) {
      fieldErrors.status =
        'Указан недопустимый статус';
    } else {
      updates.status = value.status;
    }
  }

  if ('room' in value) {
    if (typeof value.room !== 'string') {
      fieldErrors.room =
        'Комната должна быть строкой';
    } else {
      const normalizedRoom =
        value.room.trim();

      if (normalizedRoom.length === 0) {
        fieldErrors.room =
          'Комната обязательна';
      } else {
        updates.room = normalizedRoom;
      }
    }
  }

  if ('lastCalibrationDate' in value) {
    if (
      value.lastCalibrationDate === null
    ) {
      updates.lastCalibrationDate = null;
    } else if (
      typeof value.lastCalibrationDate !==
      'string'
    ) {
      fieldErrors.lastCalibrationDate =
        'Дата должна быть строкой или null';
    } else if (
      !isValidDateString(
        value.lastCalibrationDate,
      )
    ) {
      fieldErrors.lastCalibrationDate =
        'Дата должна быть корректной и иметь формат YYYY-MM-DD';
    } else {
      updates.lastCalibrationDate =
        value.lastCalibrationDate;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      fieldErrors,
    };
  }

  return {
    success: true,
    data: updates,
  };
}

async function readJsonBody(
  request: Request,
): Promise<JsonReadResult> {
  try {
    const data: unknown =
      await request.clone().json();

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
    };
  }
}

function parseId(
  value: unknown,
): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

function getNextId(): number {
  if (equipment.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...equipment.map(item => item.id),
    ) + 1
  );
}

function errorResponse(
  status: number,
  message: string,
  fieldErrors?: FieldErrors,
) {
  if (fieldErrors === undefined) {
    return HttpResponse.json(
      { message },
      { status },
    );
  }

  return HttpResponse.json(
    {
      message,
      fieldErrors,
    },
    { status },
  );
}

export const handlers = [
  /**
   * GET /api/equipment
   *
   * 200 — список получен.
   */
  http.get(
    '/api/equipment',
    async () => {
      await delay(API_DELAY);

      return HttpResponse.json(
        equipment,
        {
          status: 200,
        },
      );
    },
  ),

  /**
   * POST /api/equipment
   *
   * 201 — запись создана.
   * 400 — некорректный JSON или данные.
   */
  http.post(
    '/api/equipment',
    async ({ request }) => {
      await delay(API_DELAY);

      const jsonResult =
        await readJsonBody(request);

      if (!jsonResult.success) {
        return errorResponse(
          400,
          'Тело запроса содержит некорректный JSON',
        );
      }

      const validationResult =
        validateCreateEquipmentInput(
          jsonResult.data,
        );

      if (!validationResult.success) {
        return errorResponse(
          400,
          'Не удалось создать оборудование: проверьте введённые данные',
          validationResult.fieldErrors,
        );
      }

      const createdEquipment: Equipment = {
        id: getNextId(),
        ...validationResult.data,
      };

      equipment = [
        ...equipment,
        createdEquipment,
      ];

      return HttpResponse.json(
        createdEquipment,
        {
          status: 201,
        },
      );
    },
  ),

  /**
   * PATCH /api/equipment/:id
   *
   * 200 — запись обновлена.
   * 400 — некорректный id, JSON или данные.
   * 404 — запись не найдена.
   */
  http.patch(
    '/api/equipment/:id',
    async ({ request, params }) => {
      await delay(API_DELAY);

      const id = parseId(params.id);

      if (id === null) {
        return errorResponse(
          400,
          'Некорректный идентификатор оборудования',
          {
            id:
              'Идентификатор должен быть положительным целым числом',
          },
        );
      }

      const currentEquipment =
        equipment.find(
          item => item.id === id,
        );

      if (currentEquipment === undefined) {
        return errorResponse(
          404,
          `Оборудование с id ${id} не найдено`,
        );
      }

      const jsonResult =
        await readJsonBody(request);

      if (!jsonResult.success) {
        return errorResponse(
          400,
          'Тело запроса содержит некорректный JSON',
        );
      }

      const validationResult =
        validateUpdateEquipmentInput(
          jsonResult.data,
        );

      if (!validationResult.success) {
        return errorResponse(
          400,
          'Не удалось обновить оборудование: проверьте введённые данные',
          validationResult.fieldErrors,
        );
      }

      const updatedEquipment: Equipment = {
        ...currentEquipment,
        ...validationResult.data,

        // Даже если в будущем логика проверки изменится,
        // id всё равно остаётся серверным.
        id: currentEquipment.id,
      };

      equipment = equipment.map(item =>
        item.id === id
          ? updatedEquipment
          : item,
      );

      return HttpResponse.json(
        updatedEquipment,
        {
          status: 200,
        },
      );
    },
  ),

  /**
   * DELETE /api/equipment/:id
   *
   * 204 — запись удалена.
   * 404 — запись не найдена или id некорректен.
   */
  http.delete(
    '/api/equipment/:id',
    async ({ params }) => {
      await delay(API_DELAY);

      const id = parseId(params.id);

      if (id === null) {
        return errorResponse(
          404,
          'Оборудование не найдено',
        );
      }

      const equipmentExists =
        equipment.some(
          item => item.id === id,
        );

      if (!equipmentExists) {
        return errorResponse(
          404,
          `Оборудование с id ${id} не найдено`,
        );
      }

      equipment = equipment.filter(
        item => item.id !== id,
      );

      return new HttpResponse(null, {
        status: 204,
      });
    },
  ),
];