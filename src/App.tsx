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
  EquipmentRequestState
} from './types/equipment';
import { equipment } from './mocks/data';

export default function App() {
  const [requestState, setRequestState] =
  useState<EquipmentRequestState>({
    status: 'loading',
  });
  useEffect(() => {
    const controller = new AbortController();
    async function loadEquipment()
    {
      try{
        
        setRequestState({status : 'loading'});
        const equipment = await getEquipment({signal: controller.signal});
        setRequestState({status : 'success', equipment: equipment});
      }
      catch(error){
        if ( error instanceof DOMException && error.name === 'AbortError' ) 
          { return;}

        setRequestState({status: 'error', message: error instanceof Error ? error.message : 'Unknown error'});
        
      }
    }
    void loadEquipment();
    return () => {controller.abort();};
  }, []
  )


  switch (requestState.status) {
  case 'loading':
      return <h1>Загрузка...</h1>;
  case 'error':
      return <div><h1>Произошла ошибка:</h1>
    <p>{requestState.message}</p></div>;
  case 'success':
    if (requestState.equipment.length === 0)
      return <h1>Список оборудования пуст</h1>;
    else
    {
      return <EquipmentList equipment={requestState.equipment}/>;
    }
  default:
      console.log('Something went wrong');
      return <h1>Something went wrong</h1>;
  }
}