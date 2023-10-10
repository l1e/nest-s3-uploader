import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';


// Output formater if we get error.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let errroData: any = exception.getResponse();
        let errorMessageFormatted: string;

        if (typeof errroData === 'object') {
            errorMessageFormatted = errroData.message
        } else {
            errorMessageFormatted = errroData
        }

        response
            .status(status)
            .json({
                success: false,
                status_code: status,
                errors: {
                    error_code: status,
                    error_message: errorMessageFormatted
                },
            });
    }
}