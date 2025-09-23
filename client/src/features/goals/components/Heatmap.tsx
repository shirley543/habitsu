import React, { createContext, useContext, useRef, forwardRef, type JSX } from "react";
import { cn } from "@/lib/utils";
import HoverPopover from "@/components/custom/HoverPopup";
import { CalendarDays } from "lucide-react";
import { GoalQuantifyType, type GoalEntryResponse } from "@habit-tracker/shared";
import { computeCellColour, type ColourGoalData } from "@/lib/colourUtils";
import { getEntryDataForDate } from "../EntryUtils";
import { daysOfWeekShort, getPartialDaysOfWeekShort, monthsOfYearShort } from "@/lib/dateUtils";

/**
 * Heatmap Display State
 */
export enum HeatmapDisplayState {
  WITH_LABELS = "with-labels",
  NO_LABELS = "no-labels",
}

/**
 * Heatmap Cell Component
 */
interface CellProps {
  date: Date;
  goalData: ColourGoalData;
  entryData: GoalEntryResponse | undefined;
}

const Cell = React.memo(
  forwardRef<HTMLDivElement, CellProps>(({ date, goalData, entryData }, ref) => {
    const cellColor = computeCellColour(goalData, entryData);

    const labelText = (() => {
      switch (goalData.goalType) {
        case GoalQuantifyType.Numeric:
          return entryData?.numericValue ? `${entryData.numericValue} ${goalData.numericUnit}` : "No entry";
        case GoalQuantifyType.Boolean:
          return entryData ? "Completed" : "No entry";
        default:
          return "Unknown";
      }
    })();

    return (
      <HoverPopover
        triggerElem={
          <div
            ref={ref}
            className="transition-all h-5 w-5 rounded-sm border-0"
            style={{ backgroundColor: cellColor }}
          />
        }
        contentElem={
          <div className="flex flex-col justify-start bg-white text-black p-3 rounded-md shadow-xl border border-neutral-100 max-w-[262px] z-10">
            <h2 className="text-sm font-semibold">{labelText}</h2>
            <p className="text-sm font-normal pt-1">{entryData?.note}</p>
            <div className="text-zinc-500 flex flex-row gap-2 pt-2">
              <CalendarDays size={16} />
              <p className="text-xs font-normal">{date.toDateString()}</p>
            </div>
          </div>
        }
      />
    );
  })
);

/**
 * Heatmap Cache Context
 */
interface HeatmapCacheValue {
  getCells: (goalData: ColourGoalData, entriesData: GoalEntryResponse[], year: number) => JSX.Element[];
}

const HeatmapCacheContext = createContext<HeatmapCacheValue | null>(null);

export const useHeatmapCache = () => {
  const ctx = useContext(HeatmapCacheContext);
  if (!ctx) throw new Error("useHeatmapCache must be used inside a provider");
  return ctx;
};

/**
 * Heatmap Cache Provider
 */
export const HeatmapCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Record<string, JSX.Element[]>>({});

  const getDaysInYear = (year: number) => {
    const divisibleByFour = year % 4 === 0;
    const divisibleByHundred = year % 100 === 0;
    const divisibleByFourHundred = year % 400 === 0;
    const isLeapYear = divisibleByFour && (!divisibleByHundred || divisibleByFourHundred);
    return isLeapYear ? 366 : 365;
  };

  const getCells = (goalData: ColourGoalData, entriesData: GoalEntryResponse[], year: number) => {
    const cacheKey = `${goalData.id}-${year}`;
    if (cacheRef.current[cacheKey]) return cacheRef.current[cacheKey];

    const daysInYear = getDaysInYear(year);
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));

    // Progress cells
    const progressCells = [...Array(daysInYear)].map((_, idx) => {
      const cellDate = new Date(Date.UTC(year, 0, 1));
      cellDate.setUTCDate(cellDate.getUTCDate() + idx);
      const entryDataForCell = getEntryDataForDate(entriesData, cellDate);

      return (
        <Cell
          key={`cell_${goalData.id}_${idx}`}
          date={cellDate}
          goalData={goalData}
          entryData={entryDataForCell}
        />
      );
    });

    cacheRef.current[cacheKey] = progressCells;
    return progressCells;
  };

  return <HeatmapCacheContext.Provider value={{ getCells }}>{children}</HeatmapCacheContext.Provider>;
};

/**
 * Heatmap Component
 */
interface HeatmapProps {
  goalData: ColourGoalData;
  entriesData: GoalEntryResponse[];
  year: number;
  displayState?: HeatmapDisplayState;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  goalData,
  entriesData,
  year,
  displayState = HeatmapDisplayState.NO_LABELS,
}) => {
  const { getCells } = useHeatmapCache();
  const cells = getCells(goalData, entriesData, year);

  const contentSlot = (() => {
    switch (displayState) {
      case HeatmapDisplayState.WITH_LABELS: {
        const a = cells.slice();
        const arrays: JSX.Element[][] = [];
        const size = 7;

        while (a.length > 0) arrays.push(a.splice(0, size));

        // Month labels
        for (let i = 0; i < arrays.length; i++) {
          const firstDayOfMonthElem = arrays[i].find((elem): elem is React.ReactElement<CellProps> => elem.type === Cell && elem.props.date.getDate() === 1);
          const labelElement = firstDayOfMonthElem ? (
            <div className="w-5 text-xs font-medium flex justify-center items-center">
              {monthsOfYearShort[firstDayOfMonthElem.props.date.getMonth()]}
            </div>
          ) : (
            <div></div>
          );
          arrays[i].unshift(labelElement);
        }

        // Weekday labels
        const weekdayLabels = daysOfWeekShort.map((shortLabel) =>
          getPartialDaysOfWeekShort([0, 2, 4]).includes(shortLabel) ? (
            <div className="h-5 text-xs font-medium flex justify-center items-center">{shortLabel}</div>
          ) : (
            <div className="weekday-empty" />
          )
        );

        const gridWithMonthLabels = arrays.flat();
        return (
          <>
            <div className="corner-holder-cell" />
            {weekdayLabels}
            {gridWithMonthLabels}
          </>
        );
      }
      case HeatmapDisplayState.NO_LABELS: {
        return <>{cells}</>;
      }
    }
  })();

  return (
    <div
      className={`grid ${displayState === HeatmapDisplayState.WITH_LABELS ? "grid-rows-8" : "grid-rows-7"} grid-flow-col gap-1 w-full overflow-x-auto`}
    >
      {contentSlot}
    </div>
  );
};
