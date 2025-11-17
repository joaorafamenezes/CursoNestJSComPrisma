import { Body, Controller, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Get, Post, Param, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Controller("tasks")
export class TasksController {

    constructor(private readonly tasksService: TasksService) {

    }

    @Get()
    findAll(@Query() PaginationDto: PaginationDto) {
        return this.tasksService.findAll(PaginationDto);
    }

    @Get(":id")
    findOneTask(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.findOneTask(id);
    }

    @UseGuards(AuthTokenGuard)
    @Post()
    create(@Body() CreateTaskDto: CreateTaskDto, @TokenPayloadParam() TokenPayloadParam: PayloadTokenDto) {
        return this.tasksService.create(CreateTaskDto, TokenPayloadParam);
    }

    @UseGuards(AuthTokenGuard)
    @Patch(":id")
    update(@Param('id') id: string, @Body() UpdateTaskDto: UpdateTaskDto, @TokenPayloadParam() TokenPayloadParam: PayloadTokenDto) {
        return this.tasksService.update(id, UpdateTaskDto, TokenPayloadParam);
    }

    @UseGuards(AuthTokenGuard)
    @Delete(":id")
    removeTask(@Param('id') id: string, @TokenPayloadParam() TokenPayloadParam: PayloadTokenDto) {
        return this.tasksService.remove(id, TokenPayloadParam);
    }
}