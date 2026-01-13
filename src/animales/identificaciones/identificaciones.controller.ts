import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../../rbac/empresa-activa.decorator';
import { IdentificacionesService } from './identificaciones.service';
import { CreateIdentificacionDto } from './dto/create-identificacion.dto';
import { UpdateIdentificacionDto } from './dto/update-identificacion.dto';

@ApiTags('Identificaciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller()
export class IdentificacionesController {
  constructor(
    private readonly identificacionesService: IdentificacionesService,
  ) {}

  @Get('animales/:animalId/identificaciones')
  @ApiOperation({ summary: 'Listar identificaciones de un animal' })
  async findByAnimal(
    @EmpresaActivaId() empresaId: bigint,
    @Param('animalId', ParseBigIntPipe) animalId: bigint,
  ) {
    return this.identificacionesService.findByAnimal(empresaId, animalId);
  }

  @Post('animales/:animalId/identificaciones')
  @ApiOperation({ summary: 'Agregar identificación a un animal' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Param('animalId', ParseBigIntPipe) animalId: bigint,
    @Body() dto: CreateIdentificacionDto,
  ) {
    return this.identificacionesService.create(empresaId, animalId, dto);
  }

  @Patch('identificaciones/:id')
  @ApiOperation({ summary: 'Actualizar identificación' })
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateIdentificacionDto,
  ) {
    return this.identificacionesService.update(empresaId, id, dto);
  }

  @Delete('identificaciones/:id')
  @ApiOperation({ summary: 'Eliminar identificación' })
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.identificacionesService.remove(empresaId, id);
  }

  @Patch('identificaciones/:id/principal')
  @ApiOperation({ summary: 'Marcar identificación como principal' })
  async setPrincipal(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.identificacionesService.setPrincipal(empresaId, id);
  }
}
