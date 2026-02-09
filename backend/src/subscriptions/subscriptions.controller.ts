import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) { }

    @Get('status')
    getStatus(@Request() req) {
        return this.service.getStatus(req.user.userId);
    }

    // Activate subscription (simple version without payment)
    @Post('activate')
    activate(@Request() req, @Body() body: { months?: number }) {
        return this.service.activateSubscription(req.user.userId, body.months || 1);
    }

    @Post('deactivate')
    deactivate(@Request() req) {
        return this.service.deactivateSubscription(req.user.userId);
    }
}
