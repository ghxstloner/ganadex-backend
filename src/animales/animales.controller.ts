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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../rbac/empresa-activa.decorator';
import { AnimalesService } from './animales.service';
import { IdentificacionesService } from './identificaciones/identificaciones.service';
import { MovimientosService } from '../movimientos/movimientos.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { QueryAnimalDto } from './dto/query-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateRazaDto } from './dto/create-raza.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { CreateCategoriaHistorialDto } from './dto/create-categoria-historial.dto';
import { CreateEstadoHistorialDto } from './dto/create-estado-historial.dto';
import { QueryAnimalMovimientosDto } from './dto/query-animal-movimientos.dto';

@ApiTags('Animales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('animales')
export class AnimalesController {
  constructor(
    private readonly animalesService: AnimalesService,
    private readonly identificacionesService: IdentificacionesService,
    private readonly movimientosService: MovimientosService,
  ) {}

  // Catálogos (rutas estáticas PRIMERO, antes de :id)
  @Get('razas')
  @ApiOperation({ summary: 'Listar razas disponibles' })
  async getRazas(@EmpresaActivaId() empresaId: bigint) {
    return this.animalesService.getRazas(empresaId);
  }

  @Get('colores-pelaje')
  @ApiOperation({ summary: 'Listar colores de pelaje disponibles' })
  async getColoresPelaje() {
    return this.animalesService.getColoresPelaje();
  }

  @Get('tipos-identificacion')
  @ApiOperation({ summary: 'Listar tipos de identificación disponibles' })
  async getTiposIdentificacion(@EmpresaActivaId() empresaId: bigint) {
    return this.identificacionesService.getTiposIdentificacion(empresaId);
  }

  @Get('categorias-animales')
  @ApiOperation({ summary: 'Listar categorías de animales disponibles' })
  async getCategoriasAnimales(
    @EmpresaActivaId() empresaId: bigint,
    @Query('sexo') sexo?: 'M' | 'F',
  ) {
    return this.animalesService.getCategoriasAnimales(empresaId, sexo);
  }

  @Get('estados-animales')
  @ApiOperation({ summary: 'Listar estados de animales disponibles' })
  async getEstadosAnimales(@EmpresaActivaId() empresaId: bigint) {
    return this.animalesService.getEstadosAnimales(empresaId);
  }

  @Post('razas')
  @ApiOperation({ summary: 'Crear una nueva raza' })
  async createRaza(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateRazaDto,
  ) {
    return this.animalesService.createRaza(empresaId, dto);
  }

  @Post('colores-pelaje')
  @ApiOperation({ summary: 'Crear un nuevo color de pelaje' })
  async createColor(@Body() dto: CreateColorDto) {
    return this.animalesService.createColor(dto);
  }

  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar animales para autocompletado (padre/madre)',
  })
  async buscarAnimales(
    @EmpresaActivaId() empresaId: bigint,
    @Query('q') query: string,
    @Query('sexo') sexo?: 'M' | 'F',
    @Query('exclude_id') excludeId?: string,
  ) {
    return this.animalesService.buscarAnimales(
      empresaId,
      query ?? '',
      sexo,
      excludeId,
    );
  }

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

  @Get(':id/movimientos')
  @ApiOperation({ summary: 'Listar movimientos del animal' })
  async getMovimientos(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Query() query: QueryAnimalMovimientosDto,
  ) {
    return this.movimientosService.findByAnimal(empresaId, id, query);
  }

  @Get(':id/ubicacion-actual')
  @ApiOperation({ summary: 'Obtener ubicación actual del animal' })
  async getUbicacionActual(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.movimientosService.getUbicacionActual(empresaId, id);
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

  @Post(':id/foto')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir foto del animal' })
  async uploadPhoto(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.animalesService.uploadPhoto(empresaId, id, file);
  }

  @Delete(':id/foto')
  @ApiOperation({ summary: 'Eliminar foto del animal' })
  async deletePhoto(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.deletePhoto(empresaId, id);
  }

  @Get(':id/categoria-historial')
  @ApiOperation({ summary: 'Obtener historial de categorías del animal' })
  async getCategoriaHistorial(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.getCategoriaHistorial(empresaId, id);
  }

  @Post(':id/categoria-historial')
  @ApiOperation({ summary: 'Cambiar categoría del animal' })
  async createCategoriaHistorial(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: CreateCategoriaHistorialDto,
  ) {
    return this.animalesService.createCategoriaHistorial(empresaId, id, dto);
  }

  @Get(':id/estado-historial')
  @ApiOperation({ summary: 'Obtener historial de estados del animal' })
  async getEstadoHistorial(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.animalesService.getEstadoHistorial(empresaId, id);
  }

  @Post(':id/estado-historial')
  @ApiOperation({ summary: 'Cambiar estado del animal' })
  async createEstadoHistorial(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: CreateEstadoHistorialDto,
  ) {
    return this.animalesService.createEstadoHistorial(empresaId, id, dto);
  }
}
