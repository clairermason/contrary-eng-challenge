const Pool = require('pg').Pool
const pool = new Pool({
  user: 'tfnzbtpwrrrbqj',
  host: 'ec2-44-207-253-50.compute-1.amazonaws.com',
  database: 'd2nqbha0vl0ohd',
  password: 'bf7877ca7a6e96acbb489159d6f2ba4a5dcda81be912b435c58b1c01a92bb573',
  port: 5432,
  ssl: { rejectUnauthorized: false }
})

const avgFundingByPerson = (request, response) => {
    const id = request.params.id
    const queryString = `
        WITH base AS (
            SELECT
            p."PERSON_ID"
            , p."COMPANY_NAME"
            , COALESCE(c."KNOWN_TOTAL_FUNDING", 0) AS KNOWN_TOTAL_FUNDING
            FROM people p
            LEFT JOIN companies c
                ON c."COMPANY_LINKEDIN_NAMES"[1] = p."COMPANY_LI_NAME"
            WHERE "PERSON_ID" = $1
        )
        SELECT
            ROUND(AVG(KNOWN_TOTAL_FUNDING)) AS AVG_FUNDING
        FROM base`

    pool.query(queryString, [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

const companiesByPerson = (request, response) => {
    const id = request.params.id
    const queryString = `
    SELECT "COMPANY_NAME" FROM people WHERE "PERSON_ID" = $1;`

    pool.query(queryString, [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

// given more time, I would create another table to track linkedin names and their relationship to company names
// this would be a complete log of all linkedin names associated with a company from both the companies and people table
// for now, I am only using linkedin names from the company table because it would take a long time to vet the logic of the new table
const investorsByCompany = (request, response) => {
    const id = request.params.id
    const queryString = `
    WITH unnested_li_names AS (
        SELECT
            unnest("COMPANY_LINKEDIN_NAMES") as "COMPANY_LINKEDIN_NAME"
            , "INVESTORS"
        FROM companies
        )
        SELECT
            "INVESTORS"
        FROM unnested_li_names
        WHERE "COMPANY_LINKEDIN_NAME" = $1;`

    pool.query(queryString, [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }


  module.exports = {
    avgFundingByPerson,
    companiesByPerson,
    investorsByCompany
  }