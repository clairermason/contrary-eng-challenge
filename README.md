I have spun up a postgres server in my Heroku app
Since data needs to be accessible in my Heroku app, I will skip the step of getting data into local server
I need to ingest data from these public s3 buckets into the server
I will write the script ingestData.js and run it locally using node
then I can query the server using psql
then I will create the API endpoints