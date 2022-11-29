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
                ON c."NAME" = p."COMPANY_NAME"
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