/**
 * Common date variables/ utils
 */

export const monthsOfYear = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const monthsOfYearShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const daysOfWeekShort = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

export const getPartialDaysOfWeekShort = (idxArray: number[]) => {
  if (idxArray.every((idx) => idx < daysOfWeekShort.length && idx >= 0)) {
    const partialDaysOfWeekShort = idxArray.map((idx) => daysOfWeekShort[idx]);
    return partialDaysOfWeekShort;
  } else {
    return daysOfWeekShort;
  }
}
