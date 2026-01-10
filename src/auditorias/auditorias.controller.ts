import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../rbac/empresa-activa.decorator';
import { AuditoriasService } from './auditorias.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { QueryPaginationDto } from '../common/dto/query-pagination.dto';

@ApiTags('Auditorías')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('auditorias')
export class AuditoriasController {
  constructor(private readonly auditoriasService: AuditoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar auditorías de inventario' })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryPaginationDto,
  ) {
    return this.auditoriasService.findAll(empresaId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva auditoría de inventario' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateAuditoriaDto,
  ) {
    return this.auditoriasService.create(empresaId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener auditoría con detalles' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.auditoriasService.findOne(empresaId, id);
  }
}
