/*
	Database Statistic Functions:
	SQL functions for deriving statistics information from tables (GoalEntry)

	Note: to be used with $queryRaw call provided by Prisma.
	Not using Prisma client API as while it can support:
	- Simple filters
	- Simple aggregates
	It does not support the following as of 7-July-2025:
	- Complex CTEs (WITH clause) and subqueries (https://github.com/prisma/prisma/issues/5617)
	- Window functions (OVER clauses) (https://github.com/prisma/prisma/issues/7039)
	- SQL functions with params (https://github.com/prisma/prisma/issues/19030)
	- Date parts extraction (https://github.com/prisma/prisma/discussions/24169)
*/

DROP FUNCTION IF EXISTS get_goal_entries_with_year_month(INT);

/*
	Returns table of goal entries, filtered by given goal ID,
	and with year and month columns added

	@param p_goal_id: ID of the goal to filter by
	@returns A table of rows with columns:
		- entry_date: date of the entry
		- numeric_value: numeric value recorded for that entry
		- year: year of entry, derived from entry_date
		- month: month of entry, derived from entry_date
*/
CREATE FUNCTION get_goal_entries_with_year_month(p_goal_id INT)
RETURNS TABLE (
    "entryDate" TIMESTAMP(3) WITHOUT TIME ZONE,
    "numericValue" INTEGER,
	"year" NUMERIC,
	"month" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ge."entryDate",
	ge."numericValue",
	EXTRACT(year FROM ge."entryDate") AS "year",
	EXTRACT(month FROM ge."entryDate") AS "month"
  FROM "GoalEntry" AS ge
  WHERE "goalId" = p_goal_id
  ORDER BY "entryDate";
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT * FROM get_goal_entries_with_year_month(11);



DROP FUNCTION IF EXISTS get_goal_entries_for_year(INT, INT);

/*
	Returns table of goal entries, filtered by given goal ID and given year,
	from entries table with year and month columns added
	
	@param p_goal_id: ID of the goal to filter by
	@returns A table of rows with columns:
		- entry_date: date of the entry
		- numeric_value: numeric value recorded for that entry
		- year: year of entry, derived from entry_date
		- month: month of entry, derived from entry_date
*/
CREATE FUNCTION get_goal_entries_for_year(p_goal_id INT, p_year INT)
RETURNS TABLE (
    "entryDate" TIMESTAMP(3) WITHOUT TIME ZONE,
    "numericValue" INTEGER,
	"year" NUMERIC,
	"month" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  	SELECT *
  	FROM (
		SELECT * FROM get_goal_entries_with_year_month(p_goal_id)
	) AS entries
  	WHERE entries."year" = p_year
  	ORDER BY entries."entryDate";
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT * FROM get_goal_entries_for_year(11, 2025);



DROP FUNCTION IF EXISTS get_goal_year_avg(INT, INT);

/*
	Returns yearly average for the given goal ID and year
	
	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns Integer representing goal's yearly average
*/
CREATE FUNCTION get_goal_year_avg(p_goal_id INT, p_year INT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT AVG("numericValue")
    FROM (
		SELECT * FROM get_goal_entries_for_year(p_goal_id, p_year)
	)
  );
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT get_goal_year_avg(11, 2025) AS "yearAvg";
SELECT get_goal_year_avg(9, 2025) AS "yearAvg";



DROP FUNCTION IF EXISTS get_goal_year_count(INT, INT);

/*
	Returns yearly entry count for the given goal ID and year
	
	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns Integer representing goal's yearly entry count
*/
CREATE FUNCTION get_goal_year_count(p_goal_id INT, p_year INT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COUNT("numericValue")
    FROM (
		SELECT * FROM get_goal_entries_for_year(p_goal_id, p_year)
	)
  );
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT get_goal_year_count(11, 2025) AS "yearCount";
SELECT get_goal_year_count(9, 2025) AS "yearCount";



DROP FUNCTION get_streaks(INT, INT);

/*
	Returns streak table for the given goal ID and year
	
	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns A table of rows with columns:
		- entry_date: date of the entry
		- numeric_value: numeric value recorded for that entry
		- year: year of entry, derived from entry_date
		- month: month of entry, derived from entry_date
*/
CREATE FUNCTION get_streaks(p_goal_id INT, p_year INT)
RETURNS TABLE (
    "normRefDate" TIMESTAMP(3) WITHOUT TIME ZONE,
    "startDate" TIMESTAMP(3) WITHOUT TIME ZONE,
	"endDate" TIMESTAMP(3) WITHOUT TIME ZONE,
	"streakLength" NUMERIC
) AS $$
BEGIN
	RETURN QUERY
		WITH numbered AS (
			SELECT
				"entryDate",
				ROW_NUMBER() OVER (ORDER BY "entryDate") AS "rowNum"
			FROM (
				SELECT * FROM get_goal_entries_for_year(p_goal_id, p_year)
			)
		),
		-- `normalised`: derived table from `numbered` which normalises 
		-- consecutive dates to the same reference point (normRefDate i.e. normalised reference date),
		-- to identify islands of consecutive dates (rows that share the same normRefDate).
		-- Column tables are:
		-- entryDate, rowNum, normRefDate (day - rowNum days)
		-- e.g.
		-- 2025-07-01, 1, 2025-06-30
		-- 2025-07-02, 2, 2025-06-30
		-- 2025-07-03, 3, 2025-06-30
		"normalised" AS (
			SELECT
				"entryDate",
				"entryDate" - ("rowNum" * INTERVAL '1 day') AS "refDate"
			FROM numbered
		),
		-- Aggregating each streak (group of consecutive dates that share the same normRefDate)
		-- by grouping by normRefDate. Columns:
		-- startDate: start day of streak
		-- endDate: final day of streak
		-- streakLength: length of streak, inclusive (of both start and end date)
		streaks AS (
			SELECT
				"refDate", 
				MIN("entryDate") AS "startDate",
				MAX("entryDate") AS "endDate",
				EXTRACT(DAY FROM (MAX("entryDate") - MIN("entryDate"))) + 1 AS "streakLength"
			FROM "normalised"
			GROUP BY "refDate"
			ORDER BY "startDate"
		)
		-- Selecting
		SELECT
      		streaks."refDate" AS "normRefDate",
      		streaks."startDate",
      		streaks."endDate",
      		streaks."streakLength"
		FROM streaks;
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT * FROM get_streaks(11, 2025);
SELECT * FROM get_streaks(9, 2025);



DROP FUNCTION IF EXISTS get_current_streak_len(INT, INT);

/*
	Returns current streak length for the given goal ID and year
	
	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns Numeric representing current streak length
*/
CREATE FUNCTION get_current_streak_len(p_goal_id INT, p_year INT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
	SELECT "streakLength"
	FROM (
		SELECT * FROM get_streaks(p_goal_id, p_year)
	)
	WHERE "startDate" <= CURRENT_DATE AND "endDate" >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT get_current_streak_len(11, 2025) AS "currentStreakLen";
SELECT get_current_streak_len(9, 2025) AS "currentStreakLen";



DROP FUNCTION IF EXISTS get_max_streak_len(INT, INT);

/*
	Returns longest/ maximum streak length for the given goal ID and year
	
	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns Numeric representing longest/ maximum streak length
*/
CREATE FUNCTION get_max_streak_len(p_goal_id INT, p_year INT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
	SELECT MAX("streakLength")
	FROM (
		SELECT * FROM get_streaks(p_goal_id, p_year)
	)
  );
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT get_max_streak_len(11, 2025) AS "maxStreakLen";
SELECT get_max_streak_len(9, 2025) AS "maxStreakLen";



DROP FUNCTION IF EXISTS get_goal_year_monthly_avgs(INT, INT);

/*
	Returns table of monthly averages, filtered by given goal ID and year

	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns A table of rows with columns:
		- year: year associated with the monthly average
		- month: month associated with the monthly average
		- average: monthly average value
*/
CREATE FUNCTION get_goal_year_monthly_avgs(p_goal_id INT, p_year INT)
RETURNS TABLE (
	"year" NUMERIC,
	"month" NUMERIC,
	"average" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
	WITH yearsMonths AS (
		SELECT * FROM get_goal_entries_with_year_month(p_goal_id)
	)
	SELECT
		ym."year",
		ym."month",
		AVG(ym."numericValue") AS "average"
	FROM yearsMonths ym
	WHERE ym."year" = p_year
	GROUP BY ym."year", ym."month"
	ORDER BY ym."year", ym."month";
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT * FROM get_goal_year_monthly_avgs(11, 2025);
SELECT * FROM get_goal_year_monthly_avgs(9, 2025);



DROP FUNCTION IF EXISTS get_numeric_stats(INT, INT);

/*
	Returns consolidated numeric statistics, filtered by given goal ID and year

	@param p_goal_id: ID of the goal to filter by
	@param p_year: year to filter by
	@returns A table of rows with columns:
		- yearAvg: entries average for the year
		- yearCount: entries count for the year
		- currentStreakLen: length of current entry streak for the year ("current" being current date i.e. today)
		- maxStreakLen: length of maximum entry streak for the year
*/
CREATE FUNCTION get_numeric_stats(p_goal_id INT, p_year INT)
RETURNS TABLE (
	"yearAvg" NUMERIC,
	"yearCount" NUMERIC,
	"currentStreakLen" NUMERIC,
	"maxStreakLen" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
	SELECT
		get_goal_year_avg(p_goal_id, p_year) AS "yearAvg",
		get_goal_year_count(p_goal_id, p_year) AS "yearCount",
		get_current_streak_len(p_goal_id, p_year) AS "currentStreakLen",
		get_max_streak_len(p_goal_id, p_year) AS "maxStreakLen";
END;
$$ LANGUAGE plpgsql;

-- Examples
SELECT * FROM get_numeric_stats(11, 2025);
SELECT * FROM get_numeric_stats(9, 2025);
