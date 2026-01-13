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
  FileTypeValidator,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../rbac/empresa-activa.decorator';
import { AnimalesService } from './animales.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { QueryAnimalDto } from './dto/query-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateRazaDto } from './dto/create-raza.dto';
import { CreateColorDto } from './dto/create-color.dto';

@ApiTags('Animales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('animales')
export class AnimalesController {
  constructor(private readonly animalesService: AnimalesService) {}

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
  @ApiOperation({ summary: 'Buscar animales para autocompletado (padre/madre)' })
  async buscarAnimales(
    @EmpresaActivaId() empresaId: bigint,
    @Query('q') query: string,
    @Query('sexo') sexo?: 'M' | 'F',
  ) {
    return this.animalesService.buscarAnimales(empresaId, query ?? '', sexo);
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.animalesService.uploadPhoto(empresaId, id, file);
  }
}
