import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UserAlreadyExistsError } from '../errors/userAlreadyExists.error';
import { UserNotFoundError } from '../errors/userNotFound.error';
import { UserPasswordInputInvalidError } from '../errors/userPasswordInputInvalid.error';
import { UserDomainError } from '../errors/user.domainError';

/**
 * Exception filter for user domain errors.
 * Catches UserDomainError and maps to appropriate HTTP status codes and response format.
 */
@Catch(UserDomainError)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserDomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: HttpStatus;

    if (exception instanceof UserAlreadyExistsError) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof UserNotFoundError) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UserPasswordInputInvalidError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
