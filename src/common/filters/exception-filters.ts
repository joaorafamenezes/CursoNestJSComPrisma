import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { error, time } from "console";
import { errorMonitor } from "events";

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: exceptionResponse !== "" ? exceptionResponse : "Erro ao realizar esta operação",
            path: request.url
        });
    }
}