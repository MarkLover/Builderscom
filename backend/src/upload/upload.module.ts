import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [UploadController],
    providers: [UploadService],
})
export class UploadModule { }
