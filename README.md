#### Claire Mason Contrary Capital Backend/Data Engineering Take-Home Assessment

I used Postgres, Node.js, Javascript, Express and Heroku on this app.  
Links to API Routes:  
[/avg-funding-by-person/d4d9ca7b-e515-4bb9-96a1-1f80995349a6](https://contrary-eng-challenge.herokuapp.com/avg-funding-by-person/d4d9ca7b-e515-4bb9-96a1-1f80995349a6)  
[/companies-by-person/d4d9ca7b-e515-4bb9-96a1-1f80995349a6](https://contrary-eng-challenge.herokuapp.com/companies-by-person/d4d9ca7b-e515-4bb9-96a1-1f80995349a6)  
[/investors-by-company/uber-com](https://contrary-eng-challenge.herokuapp.com/investors-by-company/uber-com)  

### Part 1:

I spun up a Postgres server in my Heroku app and since data needs to be there anyways, I skipped a local server and ingested data into my postgres server directly. See [ingestData.js](https://github.com/clairermason/contrary-eng-challenge/blob/main/scripts/ingestData.js).  

### Part 2:

I did a bunch of exploratory analysis in the file [dataExploration.sql](https://github.com/clairermason/contrary-eng-challenge/blob/main/scripts/dataExploration.sql) and wrote answers to the SQL questions in [queries.sql](https://github.com/clairermason/contrary-eng-challenge/blob/main/scripts/queries.sql).  

### Part 3:

I used Express and Node.js to build my REST APIs and deployed my app on Heroku! See files [index.js](https://github.com/clairermason/contrary-eng-challenge/blob/main/index.js) and [queries.js](https://github.com/clairermason/contrary-eng-challenge/blob/main/queries.js)

### Next Steps (given more time):
1. I found that Linkedin names were a better join key, but the data is incomplete in its current form. Given more time I would have created a new table with all company names and all associated Linkedin names.
2. I would dedupe the companies table because there are quite a few duplicates on "COMPANY_NAME"
3. I would build unit tests / integration tests and a frontend
