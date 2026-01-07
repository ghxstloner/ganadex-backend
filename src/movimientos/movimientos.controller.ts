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
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { QueryMovimientoDto } from './dto/query-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@ApiTags('Movimientos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('movimientos')
export class MovimientosController {
    constructor(private readonly movimientosService: MovimientosService) { }

    @Get()
    @ApiOperation({ summary: 'Listar movimientos con paginación y filtros' })
    async findAll(
        @EmpresaActivaId() empresaId: bigint,
        @Query() query: QueryMovimientoDto,
    ) {
        return this.movimientosService.findAll(empresaId, query);
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
