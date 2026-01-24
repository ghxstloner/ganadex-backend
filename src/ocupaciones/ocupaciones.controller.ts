import {
  Body,
  Controller,
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
import { OcupacionesService } from './ocupaciones.service';
import { CreateOcupacionDto } from './dto/create-ocupacion.dto';
import { CloseOcupacionDto } from './dto/close-ocupacion.dto';
import { ListOcupacionesDto } from './dto/list-ocupaciones.dto';
import { CloseOcupacionBodyDto } from './dto/close-ocupacion-body.dto';

@ApiTags('Ocupaciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('ocupaciones')
export class OcupacionesController {
  constructor(private readonly ocupacionesService: OcupacionesService) {}

  @Get('resumen-actual')
  @ApiOperation({
    summary: 'Obtener resumen de ocupaciones actuales (por potrero y por lote)',
  })
  async getResumenActual(
    @EmpresaActivaId() empresaId: bigint,
    @Query('id_finca') id_finca?: string,
    @Query('search') search?: string,
  ) {
    return this.ocupacionesService.getResumenActual(
      empresaId,
      id_finca,
      search,
    );
  }

  @Get('activas')
  @ApiOperation({
    summary: 'Obtener ocupaciones activas (vista por potrero o lote)',
  })
  async getActivas(
    @EmpresaActivaId() empresaId: bigint,
    @Query('id_finca') id_finca?: string,
    @Query('vista') vista?: string,
  ) {
    return this.ocupacionesService.getActivas(empresaId, id_finca, vista);
  }

  @Get('historial')
  @ApiOperation({ summary: 'Listar historial de ocupaciones' })
  async getHistorial(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: ListOcupacionesDto,
  ) {
    return this.ocupacionesService.getHistorial(empresaId, query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ocupaciones con paginación y filtros' })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: ListOcupacionesDto,
  ) {
    return this.ocupacionesService.findAll(empresaId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva ocupación' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateOcupacionDto,
  ) {
    return this.ocupacionesService.create(empresaId, dto);
  }

  @Post('asignar')
  @ApiOperation({ summary: 'Asignar una ocupación activa' })
  async asignar(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateOcupacionDto,
  ) {
    return this.ocupacionesService.create(empresaId, dto);
  }

  @Post('cerrar')
  @ApiOperation({ summary: 'Cerrar una ocupación (por body)' })
  async cerrarByBody(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CloseOcupacionBodyDto,
  ) {
    return this.ocupacionesService.cerrarByBody(empresaId, dto);
  }

  @Patch(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar una ocupación (establecer fecha_fin)' })
  async cerrar(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: CloseOcupacionDto,
  ) {
    return this.ocupacionesService.cerrar(empresaId, id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ocupación por ID' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.ocupacionesService.findOne(empresaId, id);
  }
}
