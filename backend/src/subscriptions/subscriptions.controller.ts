import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
    Headers,
    Res,
    HttpStatus
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    getStatus(@Request() req) {
        return this.service.getStatus(req.user.userId);
    }

    // Generate a YooKassa payment link for premium
    @UseGuards(JwtAuthGuard)
    @Post('pay/premium')
    async payPremium(@Request() req, @Body() body: { returnUrl: string }) {
        return this.service.createPayment(req.user.userId, body.returnUrl);
    }

    // Process YooKassa webhook (Requires @Public decorator because it comes from external API)
    @Public()
    @Post('webhook')
    async handleWebhook(@Body() payload: any, @Res() res) {
        // Here we could also verify the origin IP or signature if provided by YooKassa
        await this.service.handleWebhook(payload);
        return res.status(HttpStatus.OK).send();
    }

    // Activate subscription manually (For admin testing)
    @UseGuards(JwtAuthGuard)
    @Post('activate')
    activate(@Request() req, @Body() body: { months?: number }) {
        return this.service.activateSubscription(req.user.userId, body.months || 1);
    }

    @UseGuards(JwtAuthGuard)
    @Post('deactivate')
    deactivate(@Request() req) {
        return this.service.deactivateSubscription(req.user.userId);
    }
}
