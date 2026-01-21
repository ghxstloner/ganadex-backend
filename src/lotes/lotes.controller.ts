import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../rbac/empresa-activa.decorator';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { QueryLoteDto } from './dto/query-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { BulkAssignAnimalsDto } from './dto/bulk-assign-animals.dto';
import { BulkRemoveAnimalsDto } from './dto/bulk-remove-animals.dto';

@ApiTags('Lotes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar lotes con paginación y filtros' })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryLoteDto,
  ) {
    return this.lotesService.findAll(empresaId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo lote' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateLoteDto,
  ) {
    return this.lotesService.create(empresaId, dto);
  }

  @Post(':id/bulk-assign')
  @ApiOperation({ summary: 'Asignar animales en lote (bulk)' })
  async bulkAssign(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: BulkAssignAnimalsDto,
  ) {
    return this.lotesService.bulkAssign(empresaId, id, dto);
  }

  @Post(':id/bulk-remove')
  @ApiOperation({ summary: 'Remover animales de lote (bulk)' })
  async bulkRemove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: BulkRemoveAnimalsDto,
  ) {
    return this.lotesService.bulkRemove(empresaId, id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.lotesService.findOne(empresaId, id);
  }

  @Get(':id/animales')
  @ApiOperation({ summary: 'Obtener animales de un lote' })
  async getAnimales(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.lotesService.getAnimales(empresaId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar lote' })
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateLoteDto,
  ) {
    return this.lotesService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lote' })
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.lotesService.remove(empresaId, id);
  }
}
