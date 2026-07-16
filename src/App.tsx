import {
  useEffect,
  useState,
} from 'react';

import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from './api/equipmentApi';

import {
  EquipmentList,
} from './components/EquipmentList';

import type {
  Equipment,
  CategoryFilter,
  EquipmentRequestState,
  EquipmentDeleteState,
  StatusFilter,
  EquipmentFormState,
  CreateEquipmentInput,
  UpdateEquipmentInput
} from './types/equipment';

import { EquipmentFilters } from './components/EquipmentFilters';
import { EquipmentForm, FormValues } from './components/EquipmentForms';
export default function App() {
  const [requestState, setRequestState] =
    useState<EquipmentRequestState>({
      status: 'loading',
    });
  const [searchTextState, setSearchTextState] = useState('');
  const [statusFilterState, setStatusFilterState] = useState<StatusFilter>('all');
  const [categoryFilterState, setCategoryFilterState] = useState<CategoryFilter>('all');
  const [formState, setFormState] = useState<EquipmentFormState>({ status: 'closed' });
  const [deleteState, setDeleteState] = useState<EquipmentDeleteState>({ status: 'success' });
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
  function handleFormOpen(): void {
    setFormState({ status: 'opened', operation: { mode: 'create' } })
  }

  async function handleSuccessfulSubmit(input: CreateEquipmentInput): Promise<void> {
    try {
      setFormState({ status: 'submitting', operation: { mode: 'create' } });
      const newEquipment = await createEquipment(input);
      setRequestState(current => {
        if (current.status !== 'success')
          return current;

        return { status: 'success', equipment: [...current.equipment, newEquipment] };
      })
      setFormState({ status: 'closed' });
    }
    catch (error) {
      setFormState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        operation: { mode: 'create' }
      });
    }
  }
  function handleEdit(item: Equipment): void {
    setFormState({ status: 'opened', operation: { mode: 'edit', equipment: item } });
  }
  async function handleEditSubmit(input: CreateEquipmentInput): Promise<void> {
    if (formState.status !== 'closed' && (formState.operation.mode === 'edit')) {
      try {

        setFormState({
          status: 'submitting',
          operation: { mode: 'edit', equipment: formState.operation.equipment }
        })
        const updatedEquipment = await updateEquipment(formState.operation.equipment.id, input);
        setRequestState(current => {
          if (current.status !== 'success')
            return current;

          return {
            status: 'success',
            equipment: current.equipment.map(item =>
              item.id === updatedEquipment.id
                ? updatedEquipment
                : item
            ),
          };
        })
        setFormState({ status: 'closed' });
      }
      catch (error) {
        setFormState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          operation: { mode: 'edit', equipment: formState.operation.equipment }
        });
      }
    }
  }

  async function handleDeleteSubmission(itemId: number): Promise<void> {
    if (requestState.status !== "success")
      return

    if (formState.status !== 'closed' &&
      formState.operation.mode === 'edit' &&
      formState.operation.equipment.id === itemId) {
      setDeleteState({
        status: 'error',
        message: "Can't delete equipment while it is being edited",
      });
      return;
    }

    try {
      setDeleteState({ status: 'submitting' });
      await deleteEquipment(itemId);
      setRequestState(current => {
        if (current.status !== 'success')
          return current;

        return {
          status: 'success',
          equipment: current.equipment.filter(item => item.id !== itemId)
        };
      })
      setDeleteState({ status: "success" });
    }
    catch (error) {
      setDeleteState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }


  switch (requestState.status) {
    case 'loading':
      return <h1>Загрузка...</h1>;
    case 'error':
      return <div><h1>Произошла ошибка:</h1>
        <p>{requestState.message}</p></div>;
    case 'success':
      return (<div>
        
        <EquipmentFilters onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          searchText={searchTextState}
          selectedCategory={categoryFilterState}
          selectedStatus={statusFilterState} />
          {requestState.equipment.length === 0 ? <h1>Список оборудования пуст</h1> : null}
        <EquipmentList equipment={applyFilterConditions()}
          onEdit={handleEdit} onDelete={handleDeleteSubmission}
          isSubmitting={formState.status === 'submitting' || deleteState.status === 'submitting'} />
        {deleteState.status === "error" ? <h2>{deleteState.message}</h2> : null}
        {(() => {
          switch (formState.status) {
            case 'closed':
              return <button type='button' onClick={handleFormOpen}>Открыть форму</button>
            case 'opened':
            case 'error':
            case 'submitting':
              const chooseFormId = (): string => {
                return (formState.operation.mode === 'create')
                  ? "create" : `edit-${formState.operation.equipment.id}`
              };
              const chooseFormFunc = () => {
                return (formState.operation.mode === 'create')
                  ? handleSuccessfulSubmit : handleEditSubmit
              }
              const initialFormValues = (): FormValues => {
                return (formState.operation.mode === 'create') ?
                  {
                    name: '',
                    category: '',
                    status: '',
                    room: '',
                    lastCalibrationDate: '',
                  }
                  :
                  {
                    name: formState.operation.equipment.name,
                    category: formState.operation.equipment.category,
                    status: formState.operation.equipment.status,
                    room: formState.operation.equipment.room,
                    lastCalibrationDate: (formState.operation.equipment.lastCalibrationDate)
                      ? formState.operation.equipment.lastCalibrationDate : ''
                  }
              }
              return (<div>
                {(() => (formState.operation.mode === 'edit' && formState.status !== 'submitting')
                  ? (<button type='button' onClick={handleFormOpen}>Октрыть форму</button>) : null)()}
                {(() => formState.status === 'error' ? (<h1>{formState.message}</h1>) : null)()}
                <EquipmentForm onSuccessfulSubmit={chooseFormFunc()}
                  onCancel={() => setFormState({ status: 'closed' })}
                  isSubmitting={formState.status === 'submitting' || deleteState.status === 'submitting'}
                  key={chooseFormId()}
                  initialFormValues={initialFormValues()}
                />
              </div>)
          }
        })()}
      </div>
      );
    default:
      console.log('Something went wrong');
      return <h1>Something went wrong</h1>;
  }
}