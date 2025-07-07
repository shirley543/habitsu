-- ------------------------------
-- [Average, count]
-- ------------------------------

SELECT
	AVG("numericValue") AS "AverageProgress",
	COUNT("numericValue") AS "CountProgress"
FROM (
	SELECT 
		*, 
		EXTRACT(year FROM "entryDate") AS "year" 
	FROM
		"GoalEntry"
)
WHERE "goalId"=11 AND "year"=2024

-- ------------------------------
-- [streakLength: max or current]
-- ------------------------------

-- `numbered`: CTE (Common Table Expression) with columns for:
-- entryDate: date value
-- rowNum: row number assigned to each date, ordered by entry date
WITH numbered AS (
	SELECT
		"entryDate",
		ROW_NUMBER() OVER (ORDER BY "entryDate") AS "rowNum"
	FROM (
		SELECT 
			*, 
			EXTRACT(year FROM "entryDate") AS "year" 
		FROM
			"GoalEntry"
	)
	WHERE "goalId"=11 AND "year"=2025
),
-- `normalised`: derived table from `numbered` which normalises consecutive dates to the same reference point (normRefDate i.e. normalised reference date), to identify islands of consecutive dates (rows that share the same normRefDate) e.g.
-- entryDate, rowNum, normRefDate (day - rowNum days)
-- e.g.
-- 2025-07-01, 1, 2025-06-30
-- 2025-07-02, 2, 2025-06-30
-- 2025-07-03, 3, 2025-06-30
"normalised" AS (
	SELECT
		"entryDate",
		"entryDate" - ("rowNum" * INTERVAL '1 day') AS "normRefDate"
	FROM numbered
),
-- Aggregating each streak (group of consecutive dates that share the same normRefDate)
-- by grouping by normRefDate. Columns:
-- startDate: start day of streak
-- endDate: final day of streak
-- streakLength: length of streak, inclusive (of both start and end date)
streaks AS (
	SELECT
		"normRefDate",
		MIN("entryDate") AS "startDate",
		MAX("entryDate") AS "endDate",
		EXTRACT(DAY FROM (MAX("entryDate") - MIN("entryDate"))) + 1 AS "streakLength"
	FROM "normalised"
	GROUP BY "normRefDate"
	ORDER BY "startDate"
)
-- Selecting:
-- Longest streak (maxStreakLength)

-- SELECT MAX("streakLength") AS "maxStreakLength"
-- FROM streaks

-- Selecting:
-- Current streak (currentStreakLength)
SELECT "streakLength" AS "currentStreakLength"
FROM streaks
WHERE "startDate" <= CURRENT_DATE AND "endDate" >= CURRENT_DATE


-- ------------------------------
-- [Monthly averages]
-- ------------------------------

WITH "yearsMonths" AS (
	SELECT 
		*, 
		EXTRACT(year FROM "entryDate") AS "year",
		EXTRACT(month FROM "entryDate") AS "month"
	FROM
		"GoalEntry"
	WHERE "goalId"=9
)
SELECT
	"year",
	"month",
	AVG("numericValue") AS "average"
FROM "yearsMonths"
WHERE "year"=2025
GROUP BY "year", "month"
ORDER BY "year", "month"