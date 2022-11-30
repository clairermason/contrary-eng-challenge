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

-- it looks like COMPANY_LI_NAME may be a better identifier than COMPANY_NAME
-- but there are also a lot of entries with 'n/a' in COMPANY_LI_NAME

SELECT 
    "COMPANY_NAME"
    , "COMPANY_LI_NAME"
    , COUNT(*)
FROM people
GROUP BY 1,2
ORDER BY COUNT(*) DESC;

SELECT DISTINCT "COMPANY_NAME" FROM people WHERE "COMPANY_LI_NAME" = 'microsoft' AND "COMPANY_NAME" != 'Microsoft';
                COMPANY_NAME                 
---------------------------------------------
 Microsoft - Applied Research and Technology
 Microsoft (China)
 Microsoft China Co. Ltd
 Microsoft Corp
 Microsoft Corporation
 Microsoft MSGD
 Microsoft Research
 Microsoft Research Asia
 Microsoft Research Asian
 Microsoft Visio Marketing


select "NAME", "COMPANY_LINKEDIN_NAMES" from companies where "NAME" ILIKE '%Microsoft%';

   NAME    | COMPANY_LINKEDIN_NAMES 
-----------+------------------------
 Microsoft | {microsoft}

-- it seems like the most effective structure would be to have "COMPANY_LINKEDIN_NAMES" in companies contain all LI_NAMES from people table
-- but this field looks incomplete, and I see only very few entries (25) with multiple LI NAMES in companies 
-- and most of these look like errors ('%'):
 select "NAME", "COMPANY_LINKEDIN_NAMES" from companies where ARRAY_LENGTH("COMPANY_LINKEDIN_NAMES", 1) > 1;

                 NAME                  |                  COMPANY_LINKEDIN_NAMES                   
---------------------------------------+-----------------------------------------------------------
 Captain®                              | {captainhq?trk,captainhq}
 Genomadix                             | {genomadix,genomadix-bio}
 RGo Robotics                          | {rgorobotics,r-gorobotics}
 Facedrive                             | {steeresg,facedrivecanada}
 180 Degrees Consulting                | {180-degrees-consulting,180degreesconsulting}
 Sendouts                              | {bullhorn,sendouts}
 ivee                                  | {iveeapp,ivee}
 Noom                                  | {noom,noom-inc}
 WebHostingBuzz                        | {799597,webhostingbuzz}
 Impossible Foods                      | {impossible-foods-inc%2e,impossible-foods-inc.}
 Shakers                               | {shakersworks,shakersxyz}
 tonies® - Boxine GmbH                 | {boxine-gmbh,tonies-gmbh}
 Solivus                               | {solivus,solivusltd}
 Turing.com                            | {turing,turingcom}
 Stefan's Head                         | {stefan's-head,stefan%27s-head}
 LeoLabs, Inc.                         | {leolabs-inc%2e,leolabs-inc.}
 Imperial College London               | {5106,imperial-college-london}
 Renovate America                      | {renovate-america,renovateamerica}
 Coronet Blockchain                    | {coronet-blockchain,53171782}
 Zebra Technologies                    | {167024,zebra-technologies}
 PayShepherd                           | {payshepherd,project-recapture-inc}
 Impossible Foods                      | {impossible-foods-inc%2e,impossible-foods-inc.}
 LTI - Larsen & Toubro Infotech        | {l%26t-infotech,l&t-infotech}
 IPICO                                 | {the-active-network,ipico-inc.}
 ieIMPACT Appraisal Data Entry Service | {ieimpact-technologies-inc.,ieimpact-technologies-inc%2e}

 -- given more time, I would make sure data in the companies table includes all Linkedin names from the people table 
 -- that would be pretty tricky to insert since I will need a join to company name at some point

-- what if I join on first element of linkedin name?
 SELECT 
    COUNT(DISTINCT "COMPANY_NAME")
FROM companies c
INNER JOIN people p
    ON c."COMPANY_LINKEDIN_NAMES"[1] = "COMPANY_LI_NAME"
-- 1776

 SELECT 
    COUNT(DISTINCT "COMPANY_NAME")
FROM companies c
INNER JOIN people p
    ON c."NAME" = p."COMPANY_NAME";
-- 1230
-- so it looks like joining on linkedin name is better
