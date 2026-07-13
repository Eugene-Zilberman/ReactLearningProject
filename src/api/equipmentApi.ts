import {Equipment, CreateEquipmentInput, UpdateEquipmentInput} from '../types/equipment'
import * as valid from './equipmentValidators';


type ErrorResponse = 
{
  message: string,
  fieldErrors?: Record<string, string>
}

function isStringDictionary(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' && // Must be an object
    value !== null &&            // Exclude null (typeof null is 'object')
    !Array.isArray(value) && // Exclude arrays (typeof [] is 'object')
    Object.values(value).every(val => typeof val === 'string')
       
  );
}

function isErrorResponse(data: unknown): data is ErrorResponse
{

  return typeof data === 'object' &&
  data !== null &&

  'message' in data &&
  typeof data.message === 'string' &&
  
  (!('fieldErrors' in data) || 
  ('fieldErrors' in data &&
  isStringDictionary(data.fieldErrors)));
}

export async function getEquipment(
  options?: { signal?: AbortSignal },
): Promise<Equipment[]> 
{
  console.log("We entered get")
  const url = "/api/equipment"; 
  try {
    console.log("fetch got started")
    const response = await fetch(url,
      {signal: options?.signal}
    );
    console.log("fetch ended");
    if (!response.ok) {
      console.log("the response is not ok in api");
      throw new Error(`HTTP error! Status: ${response.status}`);
      
    }
    console.log("tried to get data");
    const data: unknown = await response.json();
    if (!valid.isEquipmentArray(data)) {
          throw new Error(
    'Сервер вернул некорректный список оборудования',
  );}
   return data;
  }
  catch(error)
  {
    console.log("An error during get occured: " + error);
    throw error;
  }
}

export async function createEquipment(
  input: CreateEquipmentInput,
): Promise<Equipment> 
{
  const url = "/api/equipment"; 
  try {
    const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Alert server you are sending JSON
      'Accept': 'application/json'        // Alert server you expect JSON back
    },
    body: JSON.stringify(input)
  });
  const data: unknown = await response.json(); 
  if (!response.ok)
  {
    
    if (!isErrorResponse(data))
      throw new Error(`Status: ${response.status}\nMessage: Bad response`);

    const details = data.fieldErrors
      ? Object.entries(data.fieldErrors)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : '';

    throw new Error(`Status: ${response.status}\nMessage: ${data.message}
      \nDetail: ${details}`)
  }
  if (!valid.isEquipment(data))
    throw new Error(`Status: ${response.status}\nMessage: Wrong datatype`) 

  return data;
  }
  catch(error){
    console.log("An error during post occured: " + error);
    throw error;
  }
}
export async function updateEquipment(
  id: number,
  input: UpdateEquipmentInput,
): Promise<Equipment> 
{
  const url = `/api/equipment/${id}`;
  
  try {
    const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json', // Alert server you are sending JSON
      'Accept': 'application/json'        // Alert server you expect JSON back
    },
    body: JSON.stringify(input)
  });
  const data: unknown = await response.json(); 
  if (!response.ok)
  {
    
    if (!isErrorResponse(data))
      throw new Error(`Status: ${response.status}\nMessage: Bad response`);

    const details = data.fieldErrors
      ? Object.entries(data.fieldErrors)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : '';

    throw new Error(`Status: ${response.status}\nMessage: ${data.message}
      \nDetail: ${details}`)
  }
  if (!valid.isEquipment(data))
    throw new Error(`Status: ${response.status}\nMessage: Wrong datatype`) 

  return data;
  }
  catch(error){
    console.log("An error during patch occured: " + error);
    throw error;
  }
  
}

export async function deleteEquipment(
  id: number,
): Promise<void> {  const url = `/api/equipment/${id}`;
  
  try {
    const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json', // Alert server you are sending JSON
      'Accept': 'application/json'        // Alert server you expect JSON back
    },
  });
  if (response.ok)
    return;

  const data: unknown = await response.json(); 

  if (!isErrorResponse(data))
    throw new Error(`Status: ${response.status}\nMessage: Bad response`);

  const details = data.fieldErrors
    ? Object.entries(data.fieldErrors)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    : '';

  throw new Error(`Status: ${response.status}\nMessage: ${data.message}
    \nDetail: ${details}`)
  }


  catch(error){
    console.log("An error during delete occured: " + error);
    throw error;
  }
}
