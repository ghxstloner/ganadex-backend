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
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { QueryAnimalDto } from './dto/query-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@ApiTags('Animales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('animales')
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar animales con paginación y filtros' })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryAnimalDto,
  ) {
    return this.animalesService.findAll(empresaId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo animal' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateAnimalDto,
  ) {
    return this.animalesService.create(empresaId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener animal por ID' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.findOne(empresaId, id);
  }

  @Get(':id/perfil')
  @ApiOperation({
    summary: 'Obtener perfil completo del animal con historial',
  })
  async getProfile(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.getProfile(empresaId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar animal' })
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateAnimalDto,
  ) {
    return this.animalesService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar animal' })
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.remove(empresaId, id);
  }
}
