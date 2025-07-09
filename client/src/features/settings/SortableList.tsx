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

import {SortableItem} from './SortableItem';

// TODOsss need to generalize this...
// items passed in could be anything... goals, etc. Pass in set and item arrays?
// rendered item could also be anything... pass in as React Node?
interface SortableListProps {
  node: React.ReactNode,
}

export const SortableList: React.FC<SortableListProps> = ({ node }) => {
  const [items, setItems] = useState([1, 2, 3]);
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
        {items.map(id => <SortableItem key={id} id={id} children={node}/>)}
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
        const oldIndex = items.indexOf(active.id as number);
        const newIndex = items.indexOf(over.id as number);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        console.log(newArray);
        return newArray;
      });
    }
  }
}