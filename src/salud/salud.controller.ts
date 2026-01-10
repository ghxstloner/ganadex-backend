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
import { SaludService } from './salud.service';
import { CreateEventoSanitarioDto } from './dto/create-evento-sanitario.dto';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { QueryEventoSanitarioDto } from './dto/query-evento-sanitario.dto';
import { UpdateEventoSanitarioDto } from './dto/update-evento-sanitario.dto';

@ApiTags('Salud')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  // Eventos Sanitarios
  @Get('eventos')
  @ApiOperation({ summary: 'Listar eventos sanitarios' })
  async findAllEventos(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryEventoSanitarioDto,
  ) {
    return this.saludService.findAllEventos(empresaId, query);
  }

  @Post('eventos')
  @ApiOperation({ summary: 'Crear evento sanitario' })
  async createEvento(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateEventoSanitarioDto,
  ) {
    return this.saludService.createEvento(empresaId, dto);
  }

  @Get('eventos/:id')
  @ApiOperation({ summary: 'Obtener evento sanitario por ID' })
  async findOneEvento(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.saludService.findOneEvento(empresaId, id);
  }

  @Patch('eventos/:id')
  @ApiOperation({ summary: 'Actualizar evento sanitario' })
  async updateEvento(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateEventoSanitarioDto,
  ) {
    return this.saludService.updateEvento(empresaId, id, dto);
  }

  @Delete('eventos/:id')
  @ApiOperation({ summary: 'Eliminar evento sanitario' })
  async removeEvento(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.saludService.removeEvento(empresaId, id);
  }

  // Tratamientos
  @Get('tratamientos')
  @ApiOperation({ summary: 'Listar tratamientos' })
  async findAllTratamientos(@EmpresaActivaId() empresaId: bigint) {
    return this.saludService.findAllTratamientos(empresaId);
  }

  @Post('tratamientos')
  @ApiOperation({ summary: 'Crear tratamiento con retiro sanitario opcional' })
  async createTratamiento(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateTratamientoDto,
  ) {
    return this.saludService.createTratamiento(empresaId, dto);
  }

  // Alertas y Restricciones
  @Get('alertas')
  @ApiOperation({ summary: 'Animales con retiro sanitario activo' })
  async getAlertas(@EmpresaActivaId() empresaId: bigint) {
    return this.saludService.getAlertas(empresaId);
  }

  @Get('animal/:id/restricciones')
  @ApiOperation({ summary: 'Verificar restricciones de retiro de un animal' })
  async getRestricciones(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.saludService.getRestricciones(empresaId, id);
  }
}
