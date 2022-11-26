const AWS = require("aws-sdk");
const csv = require('csvtojson');
const { Sequelize, DataTypes } = require("sequelize");

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
      },
    logging: false
}); 
const authenticate = async () => {
    await sequelize.authenticate().then(() => {
        console.log("Success!");
        }).catch((err) => {
        console.log(err);
    });    
}

// since I need to define schema, data insertion is going to be fairly manual
// it looks like PERSON_ID is not unique 
// I'm going to keep those dupes for now and delete them later if they look like errors
// the sequelize.define method has built in CREATE TABLE IF NOT EXISTS
const createPeopleTable = async () => {
    await authenticate();
    sequelize.define('people', {
        PERSON_ID: DataTypes.STRING,
        COMPANY_NAME: DataTypes.STRING,
        COMPANY_LI_NAME: DataTypes.STRING,
        LAST_TITLE: DataTypes.STRING,
        GROUP_START_DATE: DataTypes.DATE,
        GROUP_END_DATE: DataTypes.DATE
    }).sync(); 

    const peopleModel = sequelize.model('people')
    const dataJSON = await retrieveCSV(peopleKey);
    console.log(`inserting ${dataJSON.length} rows`)
    // total rows 5391 - checked in psql that all are there
    for(let i=0; i < dataJSON.length; i++) {
        peopleModel.create({
            PERSON_ID: dataJSON[i].PERSON_ID,
            COMPANY_NAME: dataJSON[i].COMPANY_NAME,
            COMPANY_LI_NAME: dataJSON[i].COMPANY_LI_NAME,
            LAST_TITLE: dataJSON[i].LAST_TITLE,
            GROUP_START_DATE: dataJSON[i].GROUP_START_DATE || null,
            GROUP_END_DATE: dataJSON[i].GROUP_END_DATE || null
        });
    }
    console.log('rows inserted')
}

createPeopleTable();

// seeing some dupes on NAME, so I'm just gonna allow them for now so I can get all data into the db
const createCompanyTable = async () => {
    sequelize.define('companies', {
        NAME: DataTypes.STRING,
        COMPANY_LINKEDIN_NAMES: DataTypes.ARRAY(DataTypes.STRING),
        DESCRIPTION: DataTypes.STRING(10000),
        HEADCOUNT: DataTypes.BIGINT,
        FOUNDING_DATE: DataTypes.DATE,
        MOST_RECENT_RAISE:  DataTypes.BIGINT,
        MOST_RECENT_VALUATION: DataTypes.BIGINT,
        INVESTORS: DataTypes.ARRAY(DataTypes.STRING),
        KNOWN_TOTAL_FUNDING: DataTypes.BIGINT,
    }).sync();
    
    
    const companies = sequelize.model('companies')
    const dataJSON = await retrieveCSV(companiesKey);
    console.log(`inserting ${dataJSON.length} rows`)

    // total rows 10711 - checked in psql that all are there
    // im getting timeouts so break up the JSON into chunks
    const totalLength = dataJSON.length
    let lengthArray = []
    for(let x = 0; x <= totalLength; x = x+2000){
        lengthArray.push(x)
    }
    lengthArray.push(totalLength);
    for(let j = 0; j < lengthArray.length; j++){
        let beginIndex = lengthArray[j];
        let endIndex = lengthArray[j+1]
        for(let i = beginIndex; i < endIndex; i++){
            await companies.create({
            NAME: dataJSON[i].NAME,
            COMPANY_LINKEDIN_NAMES: JSON.parse(dataJSON[i].COMPANY_LINKEDIN_NAMES),
            DESCRIPTION: dataJSON[i].DESCRIPTION,
            HEADCOUNT: dataJSON[i].HEADCOUNT || null,
            FOUNDING_DATE: dataJSON[i].FOUNDING_DATE || null,
            MOST_RECENT_RAISE: dataJSON[i].MOST_RECENT_RAISE || null,
            MOST_RECENT_VALUATION: dataJSON[i].MOST_RECENT_VALUATION || null,
            INVESTORS: JSON.parse(dataJSON[i].INVESTORS || null),
            KNOWN_TOTAL_FUNDING: dataJSON[i].KNOWN_TOTAL_FUNDING || null
        });        
        }
    }
    
    console.log('rows inserted')
};

createCompanyTable();
console.log('yay! all data inserted!')