import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createRemoteJWKSet,
  errors as joseErrors,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { Request } from 'express';

export type AuthUser = {
  id: string;
  email?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private jwks: JWTVerifyGetKey | null = null;
  private issuer = '';

  private getJwks(): JWTVerifyGetKey {
    if (!this.jwks) {
      const url = process.env.SUPABASE_URL;
      if (!url) {
        this.logger.error(
          'SUPABASE_URL is not configured — cannot verify JWTs',
        );
        throw new ServiceUnavailableException('Auth is not configured');
      }
      this.issuer = `${url}/auth/v1`;
      this.jwks = createRemoteJWKSet(
        new URL(`${this.issuer}/.well-known/jwks.json`),
      );
    }
    return this.jwks;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const jwks = this.getJwks();

    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, jwks, { issuer: this.issuer }));
    } catch (err) {
      const transient =
        err instanceof joseErrors.JWKSTimeout ||
        !(err instanceof joseErrors.JOSEError);
      if (transient) {
        this.logger.error(`JWKS fetch failed: ${(err as Error).message}`);
        throw new ServiceUnavailableException(
          'Auth is temporarily unavailable',
        );
      }
      throw new UnauthorizedException('Invalid token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    req.user = {
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
    return true;
  }
}
