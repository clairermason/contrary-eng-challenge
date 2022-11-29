-- I am running these in command line psql
-- to access psql Heroku server:
-- heroku pg:psql postgresql-deep-63340 --app contrary-eng-challenge

-- first, I did some data exploration which I have moved into the folder dataExploration!

-- Question 1:
-- What is the average total funding of all of the companies that the person with ID = ‘92a52877-8d5d-41a6-950f-1b9c6574be7a’ has worked at?

-- this person has worked at 2 compaies (a hospital and Amazon) and only 1 (Amazon) has an entry in companies table.
-- I'm going to assume if there is no entry in the companies table there is 0 funding and looking at the API prompt that is a good assumption
-- I would ask what this stat is being used for to influence that logic, like maybe we are only interested in companies if we have data on them
-- for now this is sufficient

WITH base AS (
    SELECT
    p."PERSON_ID"
    , p."COMPANY_NAME"
    , COALESCE(c."KNOWN_TOTAL_FUNDING", 0) AS KNOWN_TOTAL_FUNDING
    FROM people p
    LEFT JOIN companies c
        ON c."NAME" = p."COMPANY_NAME"
    WHERE "PERSON_ID" = '92a52877-8d5d-41a6-950f-1b9c6574be7a'
)
SELECT
    ROUND(AVG(KNOWN_TOTAL_FUNDING)) AS AVG_FUNDING
FROM base;

-- result: 54,000,000
-- but that is just the average of amazon's total funding (108,000,000) and 0

-- Question 2:
-- How many companies are in the companies table that no people in the people table have worked for?
-- it looks like there are also companies in the people table with no entries in the companies table. Interesting!
-- I also did some spot checking to make sure this join is working and it looks like it is

WITH base AS (
SELECT DISTINCT
    c."NAME"
FROM companies c
LEFT JOIN people p
    ON p."COMPANY_NAME" = c."NAME"
WHERE p."COMPANY_NAME" IS NULL
)
SELECT COUNT(*) AS "COMPANIES_NO_PEOPLE_WORK_FOR" FROM base
;
-- result: 9403
-- that seems like a really high number considering there are only 10711 rows in companies, but the query is right


-- Question 3:
-- What are the ten most popular companies that these 1,000 people have worked for? 
-- most popular = the most people have worked at
-- if I just take "COMPANY_NAME" then I get 'Hewlett Packard Enterprise' and 'Hewlett-Packard' as separate companies
-- they have the same LI name, so I'm going to use that

SELECT
    CASE WHEN "COMPANY_LI_NAME" = 'n/a' THEN "COMPANY_NAME" ELSE "COMPANY_LI_NAME" END AS "COMPANY"
    , COUNT(DISTINCT "PERSON_ID") AS "PEOPLE_COUNT"
FROM people
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10;

-- this list is not shocking
          COMPANY           | PEOPLE_COUNT 
----------------------------+--------------
 microsoft                  |           95
 amazon                     |           76
 intel-corporation          |           54
 hewlett-packard-enterprise |           52
 google                     |           43
 meta                       |           34
 apple                      |           27
 ibm                        |           19
 adobe                      |           18
 texas-instruments          |           17

-- Question 4:
-- Identify company founders in the people table. 
-- Then identify the companies that these people have founded and list the top three largest companies by headcount, 
-- along with the name of that company and the person ID of the founder(s).

-- Answer:

-- since this data is scraped from Linkedin (I assume) I want to explore all the titles. 
-- I would be excluding a lot if I only select LAST_TITLE = 'Founder'
-- I also see some 'Owner' titles, but they mostly look like small firms so I'm going to exclude them

 SELECT "LAST_TITLE", COUNT(*) from people where "LAST_TITLE" ILIKE '%Founder%' GROUP BY 1 ORDER BY 2 DESC; 
 -- there are a bunch of titles including co-founder, founder & something, etc. 
 -- I'm going to include them all because I think co-founder counts as a founder

-- to account for companies with multiple founders, I will rank headcount and take the top 3 instead of just taking LIMIT 3
-- multi founder companies:
SELECT
    "COMPANY_NAME"
    , COUNT(DISTINCT "PERSON_ID") AS "FOUNDER_COUNT"
FROM people
WHERE "LAST_TITLE" ILIKE '%Founder%'
GROUP BY 1
ORDER BY 2 DESC;
-- no multi-founder results. but it's still best practice to include multiple founders in case the data changes.
-- 181 total companies with founders in people

 WITH founded_companies AS (
    SELECT DISTINCT
        "COMPANY_NAME"
        , "PERSON_ID"
    FROM people
    WHERE "LAST_TITLE" ILIKE '%Founder%'
)
, hc_rank AS (
    SELECT DISTINCT
    f."COMPANY_NAME"
    , f."PERSON_ID"
    , c."HEADCOUNT"
    , RANK() OVER (ORDER BY "HEADCOUNT" DESC NULLS LAST) AS "HEADCOUNT_RANK"
    -- RANK is sufficient here because ties on headcount are legitamate
FROM founded_companies f
-- I can inner join because we only care about companies that match between tables
INNER JOIN companies c
    ON c."NAME" = f."COMPANY_NAME"
)
SELECT 
    "COMPANY_NAME"
    , "PERSON_ID"
    , "HEADCOUNT"
FROM hc_rank
WHERE "HEADCOUNT_RANK" <= 3
ORDER BY "HEADCOUNT" DESC;

-- result:
   COMPANY_NAME    |              PERSON_ID               | HEADCOUNT 
-------------------+--------------------------------------+-----------
 Dafiti            | bb0d8489-4360-4a94-bd3d-c079f75afc96 |      2907
 eBay for Business | a292842c-475e-4b4f-9671-fb09536c472e |      1336
 UWorld            | c6f69f63-c7d5-419f-af34-d0cccf544e18 |       439

-- Question 5:
-- For each person in the people table, 
-- identify their 2nd most recent job (if they only have 1 job, please exclude them). 
-- What is the average duration in years of employment across everyone’s 2nd most recent job? 
-- Additionally, how many people have had more than 1 job?

-- I see a few people with multiple jobs overlapping/with the same start date (ex '9822ef5c-6f22-4523-be92-6cb3870d8f7d')
-- to get a clean count of second most recent jobs I will take ROW_NUMBER by start date to eliminate ties
-- this way even if a person has 3 jobs concurrently they will be ranked (ie not all job_rank = 1)
-- this means that for that person, their second most recent job will be one of the ones with no end date.
-- to double check it, I would ask what these stats are being used for, but for this exercise I think that logic is OK

-- this also means I will need to coalesce GROUP_END_DATE to account for jobs that are ongoing

-- I will first rank everyone's jobs in order of start date
-- then will calculate years of employment by multiplying days * 365.0 to get a float
-- to get a count of how many people have had more than 1 job I can just count distinct people_id from second most recent jobs
WITH job_rankings AS (
    SELECT
        "PERSON_ID"
        , "LAST_TITLE"
        , DATE_PART('day', COALESCE("GROUP_END_DATE", CURRENT_DATE) - "GROUP_START_DATE") / 365.0 AS "DURATION_YEARS"
        , ROW_NUMBER() OVER (PARTITION BY "PERSON_ID" ORDER BY "GROUP_START_DATE" DESC) AS job_rank
    FROM people
)
SELECT
    COUNT(DISTINCT "PERSON_ID") AS "PEOPLE_WITH_MORE_THAN_ONE_JOB"
    , ROUND(AVG("DURATION_YEARS")) AS "AVG_SECOND_MOST_RECENT_JOB_DURATION_YEARS"
FROM job_rankings
WHERE job_rank = 2;

 PEOPLE_WITH_MORE_THAN_ONE_JOB | AVG_SECOND_MOST_RECENT_JOB_DURATION_YEARS 
-------------------------------+-------------------------------------------
                           904 |                                         3


-- spot check that 1000-904 = 96 people have only had one job
WITH job_rankings AS (
     SELECT
        "PERSON_ID"
        , "LAST_TITLE"
        , DATE_PART('day', COALESCE("GROUP_END_DATE", CURRENT_DATE) - "GROUP_START_DATE") / 365.0 AS "DURATION_YEARS"
        , ROW_NUMBER() OVER (PARTITION BY "PERSON_ID" ORDER BY "GROUP_START_DATE" DESC) AS job_rank
    FROM people
)
, single_job_people AS (
SELECT
    "PERSON_ID"
    , MAX(job_rank) AS "MAX_JOB_RANK"
FROM job_rankings
GROUP BY 1
HAVING MAX(job_rank) = 1
)
SELECT COUNT(DISTINCT "PERSON_ID") FROM single_job_people;

 count 
-------
    96