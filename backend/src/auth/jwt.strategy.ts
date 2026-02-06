
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRET_KEY_REPLACE_ME_LATER', // TODO: Move to .env
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, phone: payload.phone, role: payload.role };
    }
}
