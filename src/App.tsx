import {
  useEffect,
  useState,
} from 'react';

import {
  getEquipment,
} from './api/equipmentApi';

import {
  EquipmentList,
} from './components/EquipmentList';

import type {
  Equipment,
  CategoryFilter,
  EquipmentRequestState,
  StatusFilter,
} from './types/equipment';

import { EquipmentFilters } from './components/EquipmentFilters';

export default function App() {
  const [requestState, setRequestState] =
    useState<EquipmentRequestState>({
      status: 'loading',
    });
  const [searchTextState, setSearchTextState] = useState('');
  const [statusFilterState, setStatusFilterState] = useState<StatusFilter>('all');
  const [categoryFilterState, setCategoryFilterState] = useState<CategoryFilter>('all');
  useEffect(() => {
    const controller = new AbortController();
    async function loadEquipment() {
      try {
        setRequestState({ status: 'loading' });
        const equipment = await getEquipment({ signal: controller.signal });
        setRequestState({ status: 'success', equipment: equipment });
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') { return; }

        setRequestState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });

      }
    }
    void loadEquipment();
    return () => { controller.abort(); };
  }, []
  )
  function applyFilterConditions(): Equipment[] {
    if (requestState.status === "success") {
      const trimmedText = searchTextState.trim().toLowerCase()
      return requestState.equipment
        .filter(item => (item.name.toLowerCase().includes(trimmedText) 
        || item.room.toLowerCase().includes(trimmedText) 
        || trimmedText.length === 0)
          && (statusFilterState === 'all' || item.status === statusFilterState)
          && (categoryFilterState === 'all' || item.category === categoryFilterState))
    }
    return [];
  }
  function handleSearchChange(text: string): void {
    setSearchTextState(text);
  }
  function handleStatusChange(status: StatusFilter): void {
    setStatusFilterState(status);
  }
  function handleCategoryChange(category: CategoryFilter): void {
    setCategoryFilterState(category);
  }

  switch (requestState.status) {
    case 'loading':
      return <h1>Загрузка...</h1>;
    case 'error':
      return <div><h1>Произошла ошибка:</h1>
        <p>{requestState.message}</p></div>;
    case 'success':
      if (requestState.equipment.length === 0)
        return <h1>Список оборудования пуст</h1>;
      else {
        return <div>
          <EquipmentFilters onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          searchText={searchTextState}
          selectedCategory={categoryFilterState}
          selectedStatus={statusFilterState}/>
          <EquipmentList equipment={applyFilterConditions()} />
          </div>;
      }
    default:
      console.log('Something went wrong');
      return <h1>Something went wrong</h1>;
  }
}