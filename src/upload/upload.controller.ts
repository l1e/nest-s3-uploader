import { Body, Controller, Get, Delete, Param, Post, Put, Query, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, HttpStatus, HttpException } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { ImgFileFilter, editFileName } from 'src/utils/file-upload.utils';
import { UploadService } from './upload.service';
import { config } from 'dotenv';
import { FileInfo } from 'src/utils/fileInfo.interface';

config();

@Controller('upload')
export class UploadController {

    constructor(
        private uploadService: UploadService
    ) { }

    /**
     * Upload a single file to S3.
     * @param file - The file to be uploaded.
     * @returns The url of the uploaded file in the S3 bucket.
     */
    @Post('/file')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.TEMPORARY_LOCAL_FOLDER,
                filename: editFileName,
            }),
            limits: { fileSize: 20200000 }
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {

        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        let fileInfo: FileInfo = {
            file_name_original: file.originalname,
            file_path: file.destination + "/" + file.filename,
            file_name_new: file.filename
        }

        try {
            let uploadedFile = await this.uploadService.uploadDataToS3(fileInfo, process.env.AWS_S3_FOLDER_NAME)
            return uploadedFile;
        } catch (error) {
            throw new HttpException('Error uploading file', HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }


    /**
     * Upload multiple files to S3.
     * @param files - The files to be uploaded.
     * @returns An array of URLs of the uploaded files in the S3 bucket.
     */
    @Post('/files')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: process.env.TEMPORARY_LOCAL_FOLDER,
                filename: editFileName,
            }),
            limits: { fileSize: 20200000 } // 1 000 000 = 1MB
        }),
    )
    async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>): Promise<string[]> {

        if (!files || files.length === 0) {
            throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
        }

        let result: string[] = []

        for (let index = 0; index < files.length; index++) {

            let file = files[index]

            let fileInfo: FileInfo = {
                file_name_original: file.originalname,
                file_path: file.destination + "/" + file.filename,
                file_name_new: file.filename
            }

            try {
                let uploadedFile = await this.uploadService.uploadDataToS3(fileInfo, process.env.AWS_S3_FOLDER_NAME)
                result.push(uploadedFile)
            } catch (error) {
                throw new HttpException('Error uploading files', HttpStatus.INTERNAL_SERVER_ERROR);
            }

        }

        return result

    }


    /**
     * Upload a single photo to S3 with image filter (only images in format png, jpg, gif, webp, svg, jpeg, pdf are allowed).
     * @param file - The photo to be uploaded.
     * @returns The path of the uploaded photo in the S3 bucket.
     */
    @Post('/photo')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.TEMPORARY_LOCAL_FOLDER,
                filename: editFileName,
            }),
            fileFilter: ImgFileFilter,
            limits: { fileSize: 20200000 }
        }),
    )
    async uploadPhoto(@UploadedFile() file: Express.Multer.File): Promise<string> {

        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        let fileInfo: FileInfo = {
            file_name_original: file.originalname,
            file_path: file.destination + "/" + file.filename,
            file_name_new: file.filename
        }


        try {
            let uploadedPhoto = this.uploadService.uploadDataToS3(fileInfo, process.env.AWS_S3_FOLDER_NAME)
            return uploadedPhoto;
        } catch (error) {
            throw new HttpException('Error uploading photo', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Upload multiple photos to S3 with an image filter.
     * @param files - The photos to be uploaded.
     * @returns An array of URLs of the uploaded photos in the S3 bucket.
     */
    @Post('/photos')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: './media',
                filename: editFileName,
            }),
            fileFilter: ImgFileFilter,
            limits: { fileSize: 20200000 } // 1 000 000 = 1MB
        }),
    )
    async uploadPhotos(@UploadedFiles() files: Array<Express.Multer.File>) {

        if (!files || files.length === 0) {
            throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
        }

        let uploadedPhotos: string[]

        for (let index = 0; index < files.length; index++) {

            let file = files[index]
            let fileInfo: FileInfo = {
                file_name_original: file.originalname,
                file_path: file.destination + "/" + file.filename,
                file_name_new: file.filename
            }
            try {
                let photo = await this.uploadService.uploadDataToS3(fileInfo, process.env.AWS_S3_FOLDER_NAME)
                uploadedPhotos.push(photo)
            } catch (error) {
                throw new HttpException('Error uploading photos', HttpStatus.INTERNAL_SERVER_ERROR);
            }

        }
        return uploadedPhotos
    }


    /**
     * Get all files stored files in specific folder in the S3 bucket.
     */
    @Get()
    async getAllFiles(): Promise<ListObjectsV2CommandOutput> {
        try {
            const files = await this.uploadService.getAllFiles(process.env.AWS_S3_FOLDER_NAME);
            return files;
        } catch (error) {
            throw new HttpException('Error retrieving files', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Remove a file from the S3 bucket by its name.
     */
    @Delete(':name')
    async delete(@Param('name') name: string): Promise<string> {
        try {
            const file = await this.uploadService.delete(process.env.AWS_S3_FOLDER_NAME + '/' + name);
            return file;
        } catch (error) {
            throw new HttpException('Error deleting file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
