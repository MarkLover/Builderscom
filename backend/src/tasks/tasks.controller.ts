import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req) {
        return this.tasksService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.tasksService.findOne(+id, req.user.userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.tasksService.update(+id, req.user.userId, dto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.tasksService.remove(+id, req.user.userId);
    }
}
