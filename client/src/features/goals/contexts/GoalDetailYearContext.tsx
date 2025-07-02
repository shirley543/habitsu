import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';

// Year type definition
type Year = number;

// Action type definitions
export type YearAction = { type: 'changed'; year: Year }

// Initial year
const initialGoalDetailYear: Year = 2025;

// Contexts
const GoalDetailYearContext = createContext<Year | undefined>(undefined);
const GoalDetailYearDispatchContext = createContext<Dispatch<YearAction> | undefined>(undefined);

// Reducer
function yearReducer(year: Year, action: YearAction): Year {
  switch (action.type) {
    case 'changed':
      return action.year;
    default:
      throw new Error('Unknown action: ' + (action as any).type);
  }
}

// Provider
export function GoalDetailYearProvider({ children }: { children: ReactNode }) {
  const [year, dispatch] = useReducer(yearReducer, initialGoalDetailYear);

  return (
    <GoalDetailYearContext.Provider value={year}>
      <GoalDetailYearDispatchContext.Provider value={dispatch}>
        {children}
      </GoalDetailYearDispatchContext.Provider>
    </GoalDetailYearContext.Provider>
  );
}

// Custom hooks
export function useGoalDetailYear(): Year {
  const context = useContext(GoalDetailYearContext);
  if (context === undefined) {
    throw new Error('useGoalDetailYear must be used within a GoalDetailYearProvider');
  }
  return context;
}

export function useGoalDetailYearDispatch(): Dispatch<YearAction> {
  const context = useContext(GoalDetailYearDispatchContext);
  if (context === undefined) {
    throw new Error('useGoalDetailYearDispatch must be used within a GoalDetailYearProvider');
  }
  return context;
}
