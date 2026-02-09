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
}
