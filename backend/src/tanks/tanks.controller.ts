import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { TanksService } from './tanks.service';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';

@ApiTags('tanks')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('tanks')
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tank' })
  @ApiResponse({ status: 201, description: 'Tank created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTankDto) {
    return this.tanksService.create(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tanks owned by the current user' })
  @ApiResponse({ status: 200, description: 'Array of tanks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: UserDocument) {
    return this.tanksService.findAllForUser(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tank by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the tank' })
  @ApiResponse({ status: 200, description: 'Tank document' })
  @ApiResponse({ status: 404, description: 'Tank not found or not owned by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    return this.tanksService.findOne(user._id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tank' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the tank' })
  @ApiResponse({ status: 200, description: 'Updated tank document' })
  @ApiResponse({ status: 404, description: 'Tank not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@CurrentUser() user: UserDocument, @Param('id') id: string, @Body() dto: UpdateTankDto) {
    return this.tanksService.update(user._id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tank and unlink its devices' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the tank' })
  @ApiResponse({ status: 200, description: '{ success: true }' })
  @ApiResponse({ status: 404, description: 'Tank not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@CurrentUser() user: UserDocument, @Param('id') id: string) {
    await this.tanksService.remove(user._id, id);
    return { success: true };
  }
}
