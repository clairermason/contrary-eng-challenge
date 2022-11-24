const AWS = require("aws-sdk");
const { assert } = require("console");
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
const authenticate = async () => {
    await sequelize.authenticate().then(() => {
        console.log("Success!");
        }).catch((err) => {
        console.log(err);
    });    
}

// since I need to define schema and PK/FK, this function is going to be fairly manual
// the sequelize.define method has built in CREATE TABLE IF NOT EXISTS
const createTables = async () => {
    await authenticate();
    sequelize.define('people', {
        PERSON_ID: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        COMPANY_NAME: DataTypes.STRING,
        COMPANY_LI_NAME: DataTypes.STRING,
        LAST_TITLE: DataTypes.STRING,
        GROUP_START_DATE: DataTypes.DATE,
        GROUP_END_DATE: DataTypes.DATE
    }).sync(); 

    sequelize.define('companies', {
        NAME: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        COMPANY_LINKEDIN_NAMES: DataTypes.ARRAY(DataTypes.STRING),
        DESCRIPTION: DataTypes.STRING,
        HEADCOUNT: DataTypes.INTEGER,
        FOUNDING_DATE: DataTypes.DATE,
        MOST_RECENT_RAISE: DataTypes.DATE,
        MOST_RECENT_VALUATION: DataTypes.INTEGER,
        INVESTORS: DataTypes.ARRAY(DataTypes.STRING),
        KNOWN_TOTAL_FUNDING: DataTypes.INTEGER,
    }).sync();
    
    const people = sequelize.model('people')
    const companies = sequelize.model('companies')
    // COMPANY_NAME is the foreign key linking to companies model, need to define that
}
createTables();
// tables are not being created


const insertData = async (key) => {
    const dataJSON = await retrieveCSV(key);
};

insertData(peopleKey);