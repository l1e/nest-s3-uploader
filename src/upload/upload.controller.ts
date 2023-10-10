import { Body, Controller, Get, Delete, Param, Post, Put, Query, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImgFileFilter, editFileName } from 'src/utils/file-upload.utils';
import { UploadService } from './upload.service';
import { config } from 'dotenv';

config();

@Controller('upload')
export class UploadController {

    constructor(
        private uploadService: UploadService
    ) {

    }

    // Upload file
    @Post('/file')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.TEMPORARY_FOLDER,
                filename: editFileName,
            }),
            limits: { fileSize: 20200000 }
        }),
    )
    async uploadFile(@UploadedFile() file) {
        console.log('file', file)

        console.log('process.env.TEMPORARY_FOLDER', process.env.TEMPORARY_FOLDER)

        let filename: any = {
            photo_name_original: file.originalname,
            photo_path: file.destination + "/" + file.filename,
            photo_name_new: file.filename
        }

        let photo = this.uploadService.uploadDataToS3(filename, 'media')

        return photo;

    }

    // Upload filies
    @Post('/files')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: process.env.TEMPORARY_FOLDER,
                filename: editFileName,
            }),
            limits: { fileSize: 20200000 } // 1 000 000 = 1MB
        }),
    )
    async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        console.log(files);

        let result = []

        for (let index = 0; index < files.length; index++) {

            let file = files[index]

            let filename: any = {
                photo_name_original: file['originalname'],
                photo_path: file['destination'] + "/" + file['filename'],
                photo_name_new: file['filename']
            }

            let photo = await this.uploadService.uploadDataToS3(filename, 'media')

            result.push(photo)
        }

        return result

    }


    // Upload photo
    @Post('/photo')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.TEMPORARY_FOLDER,
                filename: editFileName,
            }),
            fileFilter: ImgFileFilter,
            limits: { fileSize: 20200000 }
        }),
    )
    async uploadPhoto(@UploadedFile() file) {

        let filename: any = {
            photo_name_original: file.originalname,
            photo_path: file.destination + "/" + file.filename,
            photo_name_new: file.filename
        }
        let photo = this.uploadService.uploadDataToS3(filename, 'media')

        return photo;
    }

    // Upload Photos
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

        let result = []

        for (let index = 0; index < files.length; index++) {

            let file = files[index]
            let filename: any = {
                photo_name_original: file['originalname'],
                photo_path: file['destination'] + "/" + file['filename'],
                photo_name_new: file['filename']
            }
            let photo = await this.uploadService.uploadDataToS3(filename, 'media')
            result.push(photo)
        }
        return result
    }

    // Get all media
    @Get('')
    async getAllMedia() {
        const media = await this.uploadService.getAllMedia();
        return media;
    }

    // Remove file
    @Delete(':name')
    async delete(@Param('name') name: string) {
        const file = await this.uploadService.delete(name);
        return file;
    }
}
