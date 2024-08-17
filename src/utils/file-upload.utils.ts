import { extname } from 'path';
import { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Filter function for validating file types.
 * @param req - The request object.
 * @param file - The file object.
 * @param callback - The callback function to indicate success or failure.
 */
export const ImgFileFilter = (req, file, callback) => {

    // console.log('ImgFileFilter', file);

    const allowedExtensions = /\.(png|jpg|gif|webp|svg|jpeg|pdf)$/; // Case-insensitive regex for allowed extensions

    let preparedFileName = file.originalname.toLowerCase()

    if (!preparedFileName.match(allowedExtensions)) {
        return callback(new HttpException('Only images and pdf files are allowed!' + file.originalname + '', HttpStatus.BAD_REQUEST));
    }
    callback(null, true);
};

/**
 * Generates a unique file name by appending a random string to the original file name.
 * @param req - The request object.
 * @param file - The file object.
 * @param callback - The callback function to return the new file name.
 */
export const editFileName = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
) => {
    // Get the original file name without the extension
    const originalNameWithoutExt = file.originalname.split('.')[0];

    // Get the file extension
    const fileExtName = extname(file.originalname);

    // Generate a random 4-character string (hexadecimal)
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

    // Combine the original name, random string, and extension to create the new file name
    const newFileName = `${originalNameWithoutExt}-${randomName}${fileExtName}`;

    // Call the callback with the new file name
    callback(null, newFileName);
};