import type {
  Equipment,
} from '../types/equipment';

type EquipmentListProps =
  {
    equipment: Equipment[]
  }

export function EquipmentList({ equipment }: EquipmentListProps) {
  return (
    <table>
      <caption>Список лабораторного оборудования</caption>

      <thead>
        <tr>
          <th scope="col">Название</th>
          <th scope="col">Категория</th>
          <th scope="col">Статус</th>
          <th scope="col">Комната</th>
          <th scope="col">Последняя калибровка</th>
          <th scope="col">Действия</th>
        </tr>
      </thead>
      <tbody>
        {equipment.map((item: Equipment) => (
          <tr key={item.id}>
            {
              Object.entries(item).filter(([key]) => {return !(key === 'id')})
              .map(([key, value]) => {
                return (key === "lastCalibrationDate" && value === null 
                ? <td key={key}>Не указана</td> 
                : <td key={key}>{value}</td>)
              })
            }
          
            <td>
              <button type="button">Редактировать</button>
              <button type="button">Удалить</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}