import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);
    private readonly uploadDir = './uploads';

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleCron() {
        this.logger.debug('Running file cleanup task...');
        this.cleanupOldFiles();
    }

    private cleanupOldFiles() {
        const directory = path.join(process.cwd(), this.uploadDir);

        if (!fs.existsSync(directory)) {
            this.logger.warn(`Upload directory not found: ${directory}`);
            return;
        }

        fs.readdir(directory, (err, files) => {
            if (err) {
                this.logger.error('Unable to scan directory: ' + err);
                return;
            }

            const now = Date.now();
            const twoDaysInMillis = 48 * 60 * 60 * 1000;

            files.forEach((file) => {
                const filePath = path.join(directory, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        this.logger.error(`Error getting stats for file ${file}: ${err}`);
                        return;
                    }

                    if (now - stats.mtimeMs > twoDaysInMillis) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                this.logger.error(`Error deleting file ${file}: ${err}`);
                            } else {
                                this.logger.log(`Deleted old file: ${file}`);
                            }
                        });
                    }
                });
            });
        });
    }
}
