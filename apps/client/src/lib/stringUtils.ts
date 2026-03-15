/**
 * Common string manipulation utilities
 */

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Limit to 2 initials if needed
}
