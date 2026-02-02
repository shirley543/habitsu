import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { GoalReorderInputInvalidError } from '../errors/goalReorderInputInvalid.error';
import { GoalTypeChangeNotAllowedError } from '../errors/goalTypeChangeNotAllowed.error';
import { GoalNotFoundError } from '../errors/goalNotFound.error';
import { GoalUnauthorizedError } from '../errors/goalUnauthorized.error';
import { GoalDomainError } from '../errors/goal.domainError';

/**
 * Exception filter for goal domain errors.
 * Catches GoalDomainError and maps to appropriate HTTP status codes and response format.
 */
@Catch(GoalDomainError)
export class GoalExceptionFilter implements ExceptionFilter {
  catch(exception: GoalDomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: HttpStatus;

    if (exception instanceof GoalNotFoundError) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof GoalUnauthorizedError) {
      status = HttpStatus.FORBIDDEN;
    } else if (
      exception instanceof GoalReorderInputInvalidError ||
      exception instanceof GoalTypeChangeNotAllowedError
    ) {
      status = HttpStatus.BAD_REQUEST;
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
