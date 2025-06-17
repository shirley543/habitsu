// --------------
// Goal endpoints
// --------------
//
// GET    /goals      -> Get a list of all goals
// POST   /goals      -> Create a new goal
// GET    /goals/:id  -> Get a specific goal by ID
// PUT    /goals/:id  -> Update a specific goal
// DELETE /goals/:id  -> Delete a specific goal
// 
// Note: for GET request, should allow for request params e.g.
// - Search string for title, description
// - Order by title (asc/ desc), created date, updated date

// -----------------------------
// Goal Entry endpoints (nested)
// -----------------------------
// GET    /goals/:goalId/entries      -> List entries for a goal
// POST   /goals/:goalId/entries      -> Create a new entry for a goal
// GET    /goals/:goalId/entries/:id  -> Get a specific entry
// PUT    /goals/:goalId/entries/:id  -> Update an entry
// DELETE /goals/:goalId/entries/:id  -> Delete an entry

