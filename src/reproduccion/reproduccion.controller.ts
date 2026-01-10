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
import { ReproduccionService } from './reproduccion.service';
import { CreateEventoReproductivoDto } from './dto/create-evento-reproductivo.dto';
import { QueryEventoReproductivoDto } from './dto/query-evento-reproductivo.dto';
import { UpdateEventoReproductivoDto } from './dto/update-evento-reproductivo.dto';

@ApiTags('Reproducción')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('reproduccion')
export class ReproduccionController {
  constructor(private readonly reproduccionService: ReproduccionService) {}

  @Get('eventos')
  @ApiOperation({
    summary: 'Listar eventos reproductivos con paginación y filtros',
  })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryEventoReproductivoDto,
  ) {
    return this.reproduccionService.findAll(empresaId, query);
  }

  @Post('eventos')
  @ApiOperation({ summary: 'Crear un nuevo evento reproductivo' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateEventoReproductivoDto,
  ) {
    return this.reproduccionService.create(empresaId, dto);
  }

  @Get('eventos/:id')
  @ApiOperation({ summary: 'Obtener evento reproductivo por ID' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.reproduccionService.findOne(empresaId, id);
  }

  @Patch('eventos/:id')
  @ApiOperation({ summary: 'Actualizar evento reproductivo' })
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateEventoReproductivoDto,
  ) {
    return this.reproduccionService.update(empresaId, id, dto);
  }

  @Delete('eventos/:id')
  @ApiOperation({ summary: 'Eliminar evento reproductivo' })
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.reproduccionService.remove(empresaId, id);
  }

  @Get('semaforo')
  @ApiOperation({ summary: 'Obtener dashboard reproductivo (semáforo)' })
  async getSemaforo(@EmpresaActivaId() empresaId: bigint) {
    return this.reproduccionService.getSemaforo(empresaId);
  }
}
