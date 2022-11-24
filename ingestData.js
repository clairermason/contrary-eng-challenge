const AWS = require("aws-sdk");
const csv = require('csvtojson');
const { Sequelize, Model, DataTypes } = require("sequelize");

const bucketName = 'contrary-engineering-interview';
const peopleKey = 'data/people.csv';
const companiesKey = 'data/companies.csv';

const S3 = new AWS.S3();
const retrieveCSV = async (key) => {
    try {
        const stream = S3.getObject({Bucket: bucketName, Key: key}).createReadStream();
        const json = await csv().fromStream(stream);
        return json;
    } catch (error){
        console.log('error!')
    }    
}


// I have a postgres server up through my heroku app, so I'm gonna try to just write to that since I will need data there anyways

const path = 'postgres://tfnzbtpwrrrbqj:bf7877ca7a6e96acbb489159d6f2ba4a5dcda81be912b435c58b1c01a92bb573@ec2-44-207-253-50.compute-1.amazonaws.com:5432/d2nqbha0vl0ohd';
const sequelize = new Sequelize(path, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
});  
sequelize.authenticate().then(() => {
    console.log("Success!");
    }).catch((err) => {
    console.log(err);
    });

const fetchData = async () => {
    const peopleDataJSON = await retrieveCSV(peopleKey);
    // console.log(peopleDataJSON);
    const companiesDataJSON = await retrieveCSV(companiesKey);
    // console.log(companiesDataJSON);
};

fetchData();