-- I am running these in command line psql
-- to access psql Heroku server:
-- heroku pg:psql postgresql-deep-63340 --app contrary-eng-challenge

-- probably safest to examine the data and determine PKs since company name and person_id are not unique
-- dupes look legitamate in the people table i.e employment history
-- I think PK should be composite - rows are uniquely identified by CONCAT("PERSON_ID", "COMPANY_NAME", "GROUP_START_DATE")

SELECT 
    "PERSON_ID"
    , "COMPANY_NAME"
    , "GROUP_START_DATE"
    , COUNT(*)
FROM people
GROUP BY 1,2,3
HAVING COUNT(*) > 1
ORDER BY "PERSON_ID";
-- no rows returned

-- companies table has dupes on NAME
-- total rows: 10711
select count(distinct "NAME") from companies; -- 10633
-- so not that many dupes
-- it looks like some have different ordered lists of investors
-- or different descriptions
-- headcount dupes for the same company (see Aurora)
-- those fields arent really relavent for this analysis, so I'm just going to select DISTINCT on the fields I care about
-- in an idel world, I would update the data in the db, but I would want to ask questions about how these dupes were generated before deleting data
-- so I'm going to leave them in the table but write these queries carefully and assume that "NAME" uniquely identifies a company

SELECT 
    "NAME"
    , "HEADCOUNT"
    , "FOUNDING_DATE"
    , "MOST_RECENT_RAISE"
    , "MOST_RECENT_VALUATION"
    , "KNOWN_TOTAL_FUNDING"
    , COUNT(*)
FROM companies
GROUP BY 1,2,3,4,5,6
HAVING COUNT(*) > 1
ORDER BY "NAME";
-- still some dupes on these fields

-- lol I'm in the people table PERSON_ID = 'd4d9ca7b-e515-4bb9-96a1-1f80995349a6'
-- this must be scraped from Linkedin
