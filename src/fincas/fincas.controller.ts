import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { getUserIdFromRequest } from '../common/utils/get-user-id';
import { FincaCreateDto } from './dto/finca-create.dto';
import { FincaListDto } from './dto/finca-list.dto';
import { FincaUpdateDto } from './dto/finca-update.dto';
import { FincasService } from './fincas.service';

@UseGuards(JwtAuthGuard)
@Controller('fincas')
export class FincasController {
  constructor(private readonly fincasService: FincasService) {}

  @Get()
  async list(@Req() request: Request, @Query() query: FincaListDto) {
    const userId = getUserIdFromRequest(request);
    return this.fincasService.list(userId, query);
  }

  @Post()
  async create(@Req() request: Request, @Body() dto: FincaCreateDto) {
    const userId = getUserIdFromRequest(request);
    return this.fincasService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: FincaUpdateDto,
  ) {
    const userId = getUserIdFromRequest(request);
    return this.fincasService.update(userId, id, dto);
  }
}
