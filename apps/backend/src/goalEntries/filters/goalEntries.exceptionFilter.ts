import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { GoalEntryNotFoundError } from '../errors/goalEntryNotFound.error';
import { GoalEntryDomainError } from '../errors/goalEntry.domainError';

/**
 * Exception filter for goal entry domain errors.
 * Catches GoalEntryDomainError and maps to appropriate HTTP status codes and response format.
 */
@Catch(GoalEntryDomainError)
export class GoalEntryExceptionFilter implements ExceptionFilter {
  catch(exception: GoalEntryDomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: HttpStatus;

    if (exception instanceof GoalEntryNotFoundError) {
      status = HttpStatus.NOT_FOUND;
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
