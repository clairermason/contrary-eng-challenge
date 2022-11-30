const express = require('express')
const bodyParser = require('body-parser')
const db = require('./queries')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.json({ info: `Welcome to Claire's Contrary Capital Engineering Challenge! This app is built with Node.js, Express, and Postgres and is written in Javascript` })
  })

app.get('/avg-funding-by-person/:id', db.avgFundingByPerson)
app.get('/companies-by-person/:id', db.companiesByPerson)
app.get('/investors-by-company/:id', db.investorsByCompany)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })


