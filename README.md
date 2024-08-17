
## Title

This repository is a NestJS project showcasing implementations for uploading, retrieving, and deleting files from an AWS S3 Bucket


##  Description
Inside the **'src/upload'** folder, you'll find a controller and service that provide implementations for uploading, retrieving, and deleting files from an AWS S3 Bucket. You can see Postman collection in a folder **'Postman'**. 

## Installation

```bash
$ npm install
```

Please rename the **'.env.example'** file to **'.env'** and ensure that you update the environment variables, namely: **AWS_S3_ACCESS_KEY**, **AWS_S3_SECRET_ACCESS_KEY**, **AWS_S3_ENDPOINT**, **AWS_S3_BUCKET_NAME**,**AWS_S3_FOLDER_NAME**,  and **AWS_S3_REGION**, to match your AWS Bucket credentials and settings. You can leave the **TEMPORARY_FOLDER** environment variable as it is, since it serves as a temporary storage location for your files before they are uploaded to AWS. 
In the **PORT** enviroment varibe, you can set the port number you want to use for your application.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```



