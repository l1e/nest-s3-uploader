import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';

import * as path from 'path';
import * as fs from 'fs';



@Injectable()
export class UploadService {


    constructor(

        @InjectS3() private readonly s3: S3,

    ) { }

    /**
    * This is a function that is used to download files and photos to a bucket.
    */
    async uploadDataToS3(data, folder) {

        if (typeof data !== 'object') {
            throw new HttpException('You should provide image in a right format', HttpStatus.BAD_REQUEST)
        }
        let filename_updated = data.photo_name_new
        const newPath = folder + filename_updated;
        let teporaryPath = '../../' + folder + '/';

        const blob = await fs.readFileSync(path.resolve(__dirname, '', teporaryPath + filename_updated))

        const uploadedImage = await this.s3.putObject({
            Bucket: "divadubai",
            Key: newPath,
            Body: blob,
            ACL: "public-read"
        })

        if (uploadedImage['$metadata'].httpStatusCode === 200) {
            return newPath;
        } else {
            throw new HttpException('Error while uploading image/file to bucket', HttpStatus.BAD_REQUEST)
        }
    }

    /**
    * Get the list of all media downloaded to a bucket.
    */
    async getAllMedia() {
        let list_of_files = await this.s3.listObjectsV2({
            Bucket: "divadubai",
            Delimiter: '/',
            Prefix: 'media/upload/'
        })
        return list_of_files['Contents'];
    }

    /**
    * This is the delete file function.
    */
    async delete(name: string) {

        let fileToRemove
        let errorName = "";

        try {
            fileToRemove = await this.s3.getObject({
                Bucket: "divadubai",
                Key: name,
            })

        } catch (e) {
            errorName = e.name
        }

        if (!errorName.includes('NoSuchKey')) {

            let toRemoveFromS3 = await this.s3.deleteObject({
                Bucket: "divadubai",
                Key: name,
            })

            console.log('toRemoveFromS3', toRemoveFromS3)

            if (toRemoveFromS3['$metadata'].httpStatusCode === 204) {
                return 'The file was deleter';
            } else {
                throw new HttpException('Error while uploading image/file to bucket', HttpStatus.BAD_REQUEST)
            }

        } else {
            return "We were not able to find file " + name + ""
        }

    }

}
