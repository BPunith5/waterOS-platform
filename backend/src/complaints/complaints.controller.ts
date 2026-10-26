import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@ApiTags('complaints')
@ApiBearerAuth('JWT')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a complaint (any authenticated user)' })
  @ApiResponse({ status: 201, description: 'Complaint created' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(String(user._id), dto);
  }

  @Get('all')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'List all complaints (superadmin only)' })
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get('mine')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'List complaints for devices assigned to this admin' })
  findMine(@CurrentUser() user: UserDocument) {
    if (user.role === 'superadmin') return this.complaintsService.findAll();
    return this.complaintsService.findForAdmin(String(user._id));
  }

  @Get('my-submissions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List complaints submitted by the current user' })
  findMySubmissions(@CurrentUser() user: UserDocument) {
    return this.complaintsService.findByUser(String(user._id));
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update complaint status (admin or superadmin)' })
  @ApiResponse({ status: 200, description: 'Complaint updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.complaintsService.updateStatus(id, dto, { _id: user._id, role: user.role });
  }
}
