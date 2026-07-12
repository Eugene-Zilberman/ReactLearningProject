import { Equipment } from "./types/equipment";

export let equipment: Equipment[] = [
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
