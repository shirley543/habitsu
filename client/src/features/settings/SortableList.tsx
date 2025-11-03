import React, {useState} from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { type UniqueIdentifier } from '@dnd-kit/core';

import {SortableItem} from './SortableItem';
// import { itemsEqual } from '@dnd-kit/sortable/dist/utilities';

// TODOs #3 need to generalize this...
// items passed in could be anything... goals, etc. Pass in set and item arrays?
// rendered item could also be anything... pass in as React Node?

type A = (UniqueIdentifier | { id: UniqueIdentifier; })

// type T extends (UniqueIdentifier | { id: UniqueIdentifier; })



interface SortableListProps<T> {
  // node: React.ReactNode,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
}

// export function SortableList<T>({ items, setItems }: SortableListProps<T>) {

export function SortableList<T>() {

  type B = A & T;
  // const [items, setItems] = useState([1, 2, 3]);
  const [items, setItems] = useState([
    { id: 1, value: "1A" },
    { id: 2, value: "2A" },
    { id: 3, value: "3A" },
    { id: 4, value: "4A" },
  ]);


  const node = <div>hello</div>

  const createNode = (item: {
    id: number;
    value: string;
  }) => {
    return <div>{item.id} {item.value}</div>
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => <SortableItem key={item.id} id={item.id} children={createNode(item)}/>)}
      </SortableContext>
    </DndContext>
  );
  
  /**
   * Update item order upon end of drag event
   * @param event 
   */
  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        // const oldIndex = items.indexOf(active.id as number);
        // const newIndex = items.indexOf(over.id as number);
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        console.log(newArray);
        return newArray;
      });
    }
  }
}