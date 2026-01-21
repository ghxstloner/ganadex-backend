import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmpresaActivaGuard } from '../common/guards/empresa-activa.guard';
import { ParseBigIntPipe } from '../common/pipes/parse-bigint.pipe';
import { EmpresaActivaId } from '../rbac/empresa-activa.decorator';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { QueryMovimientoDto } from './dto/query-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@ApiTags('Movimientos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get('motivos/list')
  @ApiOperation({ summary: 'Listar motivos de movimiento (catálogo)' })
  async getMotivos(@EmpresaActivaId() empresaId: bigint) {
    return this.movimientosService.getMotivos(empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimientos con paginación y filtros' })
  async findAll(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryMovimientoDto,
  ) {
    return this.movimientosService.findAll(empresaId, query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar movimientos en Excel' })
  async exportExcel(
    @EmpresaActivaId() empresaId: bigint,
    @Query() query: QueryMovimientoDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.movimientosService.exportExcel(empresaId, query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="movimientos.xlsx"',
    );
    return buffer;
  }

  @Get('template')
  @ApiOperation({ summary: 'Descargar plantilla de importacion' })
  async template(@Res({ passthrough: true }) res: Response) {
    const buffer = await this.movimientosService.buildTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="movimientos_template.xlsx"',
    );
    return buffer;
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar movimientos desde Excel' })
  async importExcel(
    @EmpresaActivaId() empresaId: bigint,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /\.xlsx$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.movimientosService.importExcel(empresaId, file.buffer);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo movimiento' })
  async create(
    @EmpresaActivaId() empresaId: bigint,
    @Body() dto: CreateMovimientoDto,
  ) {
    return this.movimientosService.create(empresaId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  async findOne(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.movimientosService.findOne(empresaId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar movimiento' })
  async update(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateMovimientoDto,
  ) {
    return this.movimientosService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar movimiento' })
  async remove(
    @EmpresaActivaId() empresaId: bigint,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.movimientosService.remove(empresaId, id);
  }
}
