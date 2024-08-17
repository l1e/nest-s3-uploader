import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';
import { FileInfo } from 'src/utils/fileInfo.interface';

@Injectable()
export class UploadService {
    constructor(
        @InjectS3() private readonly s3: S3,
    ) { }


    /**
    * Upload a file to an S3 bucket.
    * @param data - The file data object containing metadata.
    * @param folder - The folder path in the S3 bucket where the file will be uploaded.
    * @returns {Promise<string>} - The path of the uploaded file in the S3 bucket.
    * @throws {HttpException} - Throws an exception if the file is not in the correct format or if an upload error occurs.
    */
    async uploadDataToS3(data: FileInfo, folder: string): Promise<string> {

        if (typeof data !== 'object' || !data.file_name_new) {
            throw new HttpException('Invalid file data provided', HttpStatus.BAD_REQUEST);
        }
        let filename_updated = data.file_name_new
        const newPath = folder + '/' + filename_updated;
        let teporaryPath = '../../' + process.env.TEMPORARY_LOCAL_FOLDER + '/';

        try {
            const blob = await fs.readFileSync(path.resolve(__dirname, '', teporaryPath + filename_updated))

            const uploadedImage = await this.s3.putObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: newPath,
                Body: blob,
                ACL: "public-read"
            })

            if (uploadedImage['$metadata'].httpStatusCode === 200) {
                return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/` + newPath;
            } else {
                throw new HttpException('Error while uploading image/file to bucket', HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            // Log and throw detailed errors
            console.error('Error uploading file to S3:', error);

            if (error.code === 'ENOENT') {
                throw new HttpException('File not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }


    /**
    * Retrieves a list of all files stored in the specified folder in the S3 bucket.
    * @param {string} folder - The folder in the S3 bucket where the files are stored.
    */
    async getAllFiles(folder: string): Promise<ListObjectsV2CommandOutput> {
        try {
            const listOfFiles = await this.s3.listObjectsV2({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Delimiter: '/',
                Prefix: folder,
            });

            return listOfFiles;
        } catch (error) {
            throw new HttpException('Error retrieving media files from S3', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
    * Deletes a file from the S3 bucket.
    * * @param {string} name - The key (name) of the file to delete in the S3 bucket.
    */
    async delete(name: string): Promise<string> {

        let fileToRemove: any;
        let errorName = "";

        try {
            fileToRemove = await this.s3.getObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: name,
            })

        } catch (e) {
            errorName = e.name
        }

        if (!errorName.includes('NoSuchKey')) {

            let toRemoveFromS3 = await this.s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: name,
            })

            if (toRemoveFromS3['$metadata'].httpStatusCode === 204) {
                return 'The file was deleted';
            } else {
                throw new HttpException('Error while uploading image/file to bucket', HttpStatus.BAD_REQUEST)
            }

        } else {
            return `We were not able to find a file ${name}`
        }

    }

}
