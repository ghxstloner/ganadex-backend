import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { getUserIdFromRequest } from '../common/utils/get-user-id';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaCreateDto } from './dto/empresa-create.dto';
import { EmpresaUpdateDto } from './dto/empresa-update.dto';
import { EmpresasService } from './empresas.service';

@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  async list(@Req() request: Request) {
    const userId = getUserIdFromRequest(request);
    return this.empresasService.listForUser(userId);
  }

  @Post()
  async create(@Req() request: Request, @Body() dto: EmpresaCreateDto) {
    const userId = getUserIdFromRequest(request);
    return this.empresasService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: EmpresaUpdateDto,
  ) {
    const userId = getUserIdFromRequest(request);
    return this.empresasService.update(userId, id, dto);
  }
}
