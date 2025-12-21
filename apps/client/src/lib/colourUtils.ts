/**
 * Common colour calculation utilities,
 * for e.g. determining Heatmap cell colour, Entry Calendar
 */

import {
  
  GoalQuantifyType
  
} from '@habit-tracker/validation-schemas'
import * as d3 from 'd3'
import type {GoalEntryResponse, GoalResponse} from '@habit-tracker/validation-schemas';

export type ColourGoalData = Pick<GoalResponse, 'id' | 'colour'> &
  (
    | ({ goalType: GoalQuantifyType.Numeric } & Pick<
        Extract<GoalResponse, { goalType: GoalQuantifyType.Numeric }>,
        'numericTarget' | 'numericUnit'
      >)
    | { goalType: GoalQuantifyType.Boolean }
  )

/**
 * Computes bin and color arrays, given a base color and threshold (used as max value/ max color intensity)
 * @param baseColor - Base color for representing full/ 100% progress on a gridcell
 * @param threshold - Threshold for value, used for representing full/ 100% progress
 * @returns - Bin array, and color array
 */
export const computeBinAndColorArrays = (
  baseColor: string,
  threshold: number,
) => {
  // Using threshold, compute 3 equal "bins"
  // e.g. if threshold is 30, then bin array would be:
  // [ 10, 20, 30 ]
  const baseColorFullOpacity = `#${baseColor}FF`
  const baseColorNoOpacity = `#${baseColor}00`
  const colorInterpolate = d3.interpolate(
    baseColorNoOpacity,
    baseColorFullOpacity,
  )

  const BIN_COUNT = 3
  const binIncrement = threshold / BIN_COUNT

  const binArray: Array<number> = []
  for (let i = 1; i <= BIN_COUNT; i++) {
    binArray.push(binIncrement * i)
  }

  // Using base color, compute 4 colors for range with changing opacity
  // e.g. if base color is rgb(255, 0, 0), then color array would be:
  // ['rgba(255, 0, 0, 0.25)', 'rgba(255, 0, 0, 0.5)',
  //  'rgba(255, 0, 0, 0.75)', 'rgb(255, 0, 0)']
  const COLOR_COUNT = BIN_COUNT + 1
  const colorArray: Array<string> = []
  for (let i = 1; i <= COLOR_COUNT; i++) {
    const idx = i / COLOR_COUNT
    colorArray.push(colorInterpolate(idx))
  }

  return { binArray, colorArray }
}

/**
 * Computes binned colour/ colour shade, given a base colour, value threshold, and current value
 *
 * @param baseColor - Base color for representing full/ 100% progress on a gridcell
 * @param threshold - Threshold for value, used for representing full/ 100% progress
 * @param value - Value to convert
 * @return - Color shade for given value
 */
export const computeBinnedColour = (
  baseColor: string,
  threshold: number,
  value: number,
) => {
  const { binArray, colorArray } = computeBinAndColorArrays(
    baseColor,
    threshold,
  )
  // Convert value to color
  const domain = binArray // Thresholds
  const range = colorArray // Values for each threshold
  const thresholdScale = d3.scaleThreshold(domain, range)
  const colorShade = thresholdScale(value)
  return colorShade
}

// /**
//  * Computes binned colour/ colour shade, given a bin array, color array, and current value
//  *
//  * @param binArray - Bin array of numbers
//  * @param colorArray - Color array of hex strings
//  * @param value - Value to convert
//  * @return - Color shade for given value
//  */
// export const computeBinnedColour = (binArray: number[], colorArray: string[], value: number) => {
//   // Convert value to color
//   const domain = binArray; // Thresholds
//   const range = colorArray; // Values for each threshold
//   const thresholdScale = d3.scaleThreshold(domain, range);
//   const colorShade = thresholdScale(value);
//   return colorShade;
// }

/**
 * Computes cell colour, based on goal data (base colour, quantify type, thresholds),
 * and given entry data (entry value, or presence of said entry)
 *
 * @param goalData - Data associated with a goal
 * @param entryData - Data associated with a goal entry
 * @returns - String representation of cell colour shade (hex)
 */
export const computeCellColour = (
  goalData: ColourGoalData,
  entryData: GoalEntryResponse | undefined,
) => {
  const NO_ENTRY_COLOUR = '#F5F5F5' // /< Neutral/100
  switch (goalData.goalType) {
    case GoalQuantifyType.Numeric: {
      const color =
        goalData?.numericTarget && entryData?.numericValue
          ? computeBinnedColour(
              goalData.colour,
              goalData.numericTarget,
              entryData?.numericValue,
            )
          : NO_ENTRY_COLOUR
      return color
    }

    case GoalQuantifyType.Boolean: {
      // const color = entryData ? computeBinnedColour(goalData.colour, 1, entryData ? 1 : 0)
      //  : NO_ENTRY_COLOUR;
      const color = entryData ? `#${goalData.colour}` : NO_ENTRY_COLOUR
      return color
    }
  }
}

// Input: goalData (colour and numeric target)
// Output: numeric bins. for filters (>= or <=)

// TODO list for 17-July-2025:
// - [done] Create Pages: update styling of inputs, text areas, etc. to better reflect actual behaviour
// - [done] delete entry: have delete button for EntryCreatePage
// - loading component for details loading
// - Goal order + visibility: add to Prisma schema, and logic for checking order is correct/ unique
// - use useMemo at callsite to cache computation of bins and colour shades (dependent on goal only), to see if it helps performance
// - Authentication... Auth0 since using at work? Lucia since simpler abstractions/ lets you do whatever you want? Auth.js since more popular (but mainly for Next.js?)
//     - PassportJS (older but still?). I think: go with Passport JS (learn the basics with provided guides before jumping else where)
