import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Pipe to apply a Zod schema to the request body
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema<any>) {}

  // TODOs #32: Fix this. Appears that result error not working (showing generic "Required" error but no field-specific text)
  // + code 400 undocumented
  transform(value: any) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    // ZodValidationPipe returns data whose runtime shape is guaranteed by the Zod schema,
    // but TypeScript cannot infer the validated type from ZodSchema<any>.
    /* eslint-disable @typescript-eslint/no-unsafe-return */
    return result.data;
  }
}
