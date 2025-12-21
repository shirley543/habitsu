import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";

/**
 * Wrapper for Config Service to provide type-safety when 
 * accessing environment variables
 */

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    const val = this.configService.get(key, { infer: true });
    if (val === undefined) {
      throw new Error(`Missing config key: ${key}`);
    }
    return val;
  }
}
