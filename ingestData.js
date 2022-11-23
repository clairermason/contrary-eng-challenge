// const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const { S3 } = require("@aws-sdk/client-s3");
const AWS = require("@aws-sdk/client-s3");

// const peoplePath = 'https://contrary-engineering-interview.s3.amazonaws.com/data/people.csv'
//  const companiesPath = 'https://contrary-engineering-interview.s3.amazonaws.com/data/companies.csv'
const bucketName = 'contrary-engineering-interview';
const peopleKey = 'data/people.csv';
const companiesKey = 'data/companies.csv';
const client = new AWS.S3();


const fetchData = async (key) => {
    try {
        const data = await client.getObject({Bucket: bucketName, Key: key});
        console.log(data.Body);
    } catch (error){
        console.log('error!')
    }    
}
// this is currently console logging metadata, so it is correctly accessing AWS!
// committing here so I have a record
fetchData(peopleKey);
fetchData(companiesKey);
// console.log(peoplePath);





