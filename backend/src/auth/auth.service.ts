import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CompanyUsersService } from '../company-users/company-users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private companyUsersService: CompanyUsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(phone: string, pass: string): Promise<any> {
        // First check main User table
        const user = await this.usersService.findByPhone(phone);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return { ...result, userType: 'owner' };
        }

        // Then check CompanyUser table
        const companyUser = await this.companyUsersService.findByPhone(phone);
        if (companyUser && (await bcrypt.compare(pass, companyUser.password))) {
            const { password, owner, ...result } = companyUser;
            return {
                ...result,
                userType: 'employee',
                ownerId: companyUser.ownerId,
                ownerCompany: owner.company,
                permissions: {
                    dashboard: companyUser.canDashboard,
                    projects: companyUser.canProjects,
                    finances: companyUser.canFinances,
                    commercial: companyUser.canCommercial,
                    employees: companyUser.canEmployees,
                    tasks: companyUser.canTasks,
                    profile: companyUser.canProfile,
                    subscription: companyUser.canSubscription,
                },
            };
        }

        return null;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            phone: user.phone,
            role: user.role,
            userType: user.userType,
            ownerId: user.ownerId || user.id, // For company users, use ownerId
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async telegramAuth(data: any): Promise<any> {
        const botToken = process.env.TELEGRAM_BOT_TOKEN || '8456138898:AAELmmV170xWOJ12zkj9xfkn8-MM9nA0u_U';

        // 1. Validate hash
        const { hash, ...authData } = data;
        const checkString = Object.keys(authData)
            .sort()
            .map(k => `${k}=${authData[k]}`)
            .join('\n');

        const crypto = require('crypto');
        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        if (hmac !== hash) {
            throw new UnauthorizedException('Invalid Telegram authentication hash');
        }

        // 2. Auth date check to prevent replay attacks (1 hour)
        const now = Math.floor(Date.now() / 1000);
        if (now - authData.auth_date > 3600) {
            throw new UnauthorizedException('Telegram auth data is outdated');
        }

        // 3. Find or Create user
        const fakePhone = `tg_${authData.id}`;
        let user = await this.usersService.findByPhone(fakePhone);

        if (!user) {
            // Register new user
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const newUserData = {
                name: authData.first_name + (authData.last_name ? ` ${authData.last_name}` : ''),
                phone: fakePhone,
                password: randomPassword,
                company: 'Telegram User', // Default
            };
            user = await this.usersService.create(newUserData);
        }

        // Remove password for security
        const { password, ...result } = user;
        const finalUser = { ...result, userType: 'owner' };

        return this.login(finalUser);
    }
}
