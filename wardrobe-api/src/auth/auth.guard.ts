import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { Request } from 'express';

export type AuthUser = {
  id: string;
  email?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  private jwks: JWTVerifyGetKey | null = null;
  private issuer = '';

  private getJwks(): JWTVerifyGetKey {
    if (!this.jwks) {
      const url = process.env.SUPABASE_URL;
      if (!url) {
        throw new Error('SUPABASE_URL is not configured');
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

    try {
      const { payload } = await jwtVerify(token, this.getJwks(), {
        issuer: this.issuer,
      });
      if (!payload.sub) {
        throw new Error('Token has no subject');
      }
      req.user = {
        id: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
