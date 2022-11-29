const Pool = require('pg').Pool
const pool = new Pool({
  user: 'tfnzbtpwrrrbqj',
  host: 'ec2-44-207-253-50.compute-1.amazonaws.com',
  database: 'd2nqbha0vl0ohd',
  password: 'bf7877ca7a6e96acbb489159d6f2ba4a5dcda81be912b435c58b1c01a92bb573',
  port: 5432,
  ssl: { rejectUnauthorized: false }
})

const getUsers = (request, response) => {
    const id = request.params.id
    console.log(id);
    console.log(typeof(id))
    pool.query('SELECT * FROM people WHERE "PERSON_ID" = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  module.exports = {
    getUsers
  }