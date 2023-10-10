
## Title

This repository is a NestJS project showcasing implementations for uploading, retrieving, and deleting files from an AWS S3 Bucket


##  Description
Inside the **'src/upload'** folder, you'll find a controller and service that provide implementations for uploading, retrieving, and deleting files from an AWS S3 Bucket. You can see Postman collection in a folder **'Postman'**. 

## Installation

```bash
$ npm install
```

Please rename the **'.env.example'** file to **'.env'** and ensure that you update the environment variables, namely: **AWS_S3_ACCESS_KEY**, **AWS_S3_SECRET_ACCESS_KEY**, **AWS_S3_ENDPOINT**, and **AWS_S3_REGION**, to match your AWS Bucket credentials. You can leave the **TEMPORARY_FOLDER** environment variable as it is since it serves as a temporary storage location for your files before they are uploaded to AWS.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```



