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
import { LecheService } from './leche.service';
import { CreateEntregaLecheDto } from './dto/create-entrega-leche.dto';
import { QueryEntregaLecheDto } from './dto/query-entrega-leche.dto';

@ApiTags('Leche')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('leche')
export class LecheController {
    constructor(private readonly lecheService: LecheService) { }

    // Entregas
    @Get('entregas')
    @ApiOperation({ summary: 'Listar entregas de leche' })
    async findAllEntregas(
        @EmpresaActivaId() empresaId: bigint,
        @Query() query: QueryEntregaLecheDto,
    ) {
        return this.lecheService.findAllEntregas(empresaId, query);
    }

    @Post('entregas')
    @ApiOperation({ summary: 'Crear entrega de leche' })
    async createEntrega(
        @EmpresaActivaId() empresaId: bigint,
        @Body() dto: CreateEntregaLecheDto,
    ) {
        return this.lecheService.createEntrega(empresaId, dto);
    }

    @Get('entregas/:id')
    @ApiOperation({ summary: 'Obtener entrega por ID' })
    async findOneEntrega(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.lecheService.findOneEntrega(empresaId, id);
    }

    @Delete('entregas/:id')
    @ApiOperation({ summary: 'Eliminar entrega' })
    async removeEntrega(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.lecheService.removeEntrega(empresaId, id);
    }

    // Liquidaciones
    @Get('liquidaciones')
    @ApiOperation({ summary: 'Listar liquidaciones de leche' })
    async findAllLiquidaciones(@EmpresaActivaId() empresaId: bigint) {
        return this.lecheService.findAllLiquidaciones(empresaId);
    }

    // Conciliación
    @Get('conciliacion')
    @ApiOperation({ summary: 'Comparar entregas vs liquidaciones por periodo' })
    async getConciliacion(
        @EmpresaActivaId() empresaId: bigint,
        @Query('fecha_inicio') fechaInicio: string,
        @Query('fecha_fin') fechaFin: string,
    ) {
        return this.lecheService.getConciliacion(empresaId, fechaInicio, fechaFin);
    }

    // Catálogos
    @Get('centros-recepcion')
    @ApiOperation({ summary: 'Listar centros de recepción' })
    async getCentrosRecepcion(@EmpresaActivaId() empresaId: bigint) {
        return this.lecheService.getCentrosRecepcion(empresaId);
    }

    @Get('turnos-ordenio')
    @ApiOperation({ summary: 'Listar turnos de ordeño' })
    async getTurnosOrdenio(@EmpresaActivaId() empresaId: bigint) {
        return this.lecheService.getTurnosOrdenio(empresaId);
    }
}
