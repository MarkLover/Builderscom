
import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('telegram')
    async telegramLogin(@Body() data: any) {
        return this.authService.telegramAuth(data);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);
            // Return user without password
            const { password, ...result } = user;
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}
