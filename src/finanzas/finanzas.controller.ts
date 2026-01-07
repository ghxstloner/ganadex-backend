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
import { FinanzasService } from './finanzas.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { QueryTransaccionDto } from './dto/query-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';

@ApiTags('Finanzas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('finanzas')
export class FinanzasController {
    constructor(private readonly finanzasService: FinanzasService) { }

    // Transacciones
    @Get('transacciones')
    @ApiOperation({ summary: 'Listar transacciones financieras' })
    async findAllTransacciones(
        @EmpresaActivaId() empresaId: bigint,
        @Query() query: QueryTransaccionDto,
    ) {
        return this.finanzasService.findAllTransacciones(empresaId, query);
    }

    @Post('transacciones')
    @ApiOperation({ summary: 'Crear transacción financiera' })
    async createTransaccion(
        @EmpresaActivaId() empresaId: bigint,
        @Body() dto: CreateTransaccionDto,
    ) {
        return this.finanzasService.createTransaccion(empresaId, dto);
    }

    @Get('transacciones/:id')
    @ApiOperation({ summary: 'Obtener transacción por ID' })
    async findOneTransaccion(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.finanzasService.findOneTransaccion(empresaId, id);
    }

    @Patch('transacciones/:id')
    @ApiOperation({ summary: 'Actualizar transacción' })
    async updateTransaccion(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
        @Body() dto: UpdateTransaccionDto,
    ) {
        return this.finanzasService.updateTransaccion(empresaId, id, dto);
    }

    @Delete('transacciones/:id')
    @ApiOperation({ summary: 'Eliminar transacción' })
    async removeTransaccion(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.finanzasService.removeTransaccion(empresaId, id);
    }

    // Catálogos
    @Get('tipos-transaccion')
    @ApiOperation({ summary: 'Listar tipos de transacción' })
    async getTiposTransaccion(@EmpresaActivaId() empresaId: bigint) {
        return this.finanzasService.getTiposTransaccion(empresaId);
    }

    @Get('categorias')
    @ApiOperation({ summary: 'Listar categorías financieras' })
    async getCategoriasFinancieras(@EmpresaActivaId() empresaId: bigint) {
        return this.finanzasService.getCategoriasFinancieras(empresaId);
    }

    @Get('monedas')
    @ApiOperation({ summary: 'Listar monedas disponibles' })
    async getMonedas() {
        return this.finanzasService.getMonedas();
    }
}
