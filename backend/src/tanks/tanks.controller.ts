import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { TanksService } from './tanks.service';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';

@UseGuards(JwtAuthGuard)
@Controller('tanks')
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Post()
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTankDto) {
    return this.tanksService.create(user._id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserDocument) {
    return this.tanksService.findAllForUser(user._id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.tanksService.findOne(user._id, id);
  }

  @Put(':id')
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateTankDto) {
    return this.tanksService.update(user._id, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.tanksService.remove(user._id, id);
    return { success: true };
  }
}
