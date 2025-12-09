// Type declarations to fix passport-jwt ExtractJwt typing issues
import { Request } from 'express';

declare module 'passport-jwt' {
  export interface JwtFromRequestFunction {
    (request: Request): string | null;
  }

  export interface ExtractJwtStatic {
    fromExtractors(
      extractors: Array<JwtFromRequestFunction | string>,
    ): JwtFromRequestFunction;
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    fromBodyField(field_name: string): JwtFromRequestFunction;
    fromUrlQueryParameter(param_name: string): JwtFromRequestFunction;
  }

  export const ExtractJwt: ExtractJwtStatic;

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey?: string | Buffer;
    secretOrKeyProvider?: (
      request: Request,
      rawJwtToken: string,
      done: (err: Error | null, secret?: string | Buffer) => void,
    ) => void;
    ignoreExpiration?: boolean;
    algorithms?: string[];
    audience?: string;
    issuer?: string;
    jwtid?: string;
    subject?: string;
    clockTolerance?: number;
    header?: string;
    jsonWebTokenOptions?: {
      clockTimestamp?: number;
      clockTolerance?: number;
      audience?: string | string[];
      issuer?: string | string[];
      jwtid?: string;
      subject?: string;
      noTimestamp?: boolean;
      maxAge?: string;
      encoding?: string;
    };
  }

  export interface Strategy<TRequest = Request> {
    name: string;
    authenticate(req: TRequest, options?: any): void;
  }
}
