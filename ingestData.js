const AWS = require("aws-sdk");
const csv = require('csvtojson')

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

// this function should fetch the data and insert into postgres
const fetchData = async () => {
    const peopleDataJSON = await retrieveCSV(peopleKey);
    // console.log(peopleDataJSON);
    const companiesDataJSON = await retrieveCSV(companiesKey);
    // console.log(companiesDataJSON);
};

fetchData();
