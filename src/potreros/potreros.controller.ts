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
import { PotrerosService } from './potreros.service';
import { CreatePotreroDto } from './dto/create-potrero.dto';
import { QueryPotreroDto } from './dto/query-potrero.dto';
import { UpdatePotreroDto } from './dto/update-potrero.dto';

@ApiTags('Potreros')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, EmpresaActivaGuard)
@Controller('potreros')
export class PotrerosController {
    constructor(private readonly potrerosService: PotrerosService) { }

    @Get('estados/list')
    @ApiOperation({ summary: 'Listar estados de potreros (catálogo global)' })
    async getEstados() {
        return this.potrerosService.getEstados();
    }

    @Get()
    @ApiOperation({ summary: 'Listar potreros con paginación y filtros' })
    async findAll(
        @EmpresaActivaId() empresaId: bigint,
        @Query() query: QueryPotreroDto,
    ) {
        return this.potrerosService.findAll(empresaId, query);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo potrero' })
    async create(
        @EmpresaActivaId() empresaId: bigint,
        @Body() dto: CreatePotreroDto,
    ) {
        return this.potrerosService.create(empresaId, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener potrero por ID' })
    async findOne(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.potrerosService.findOne(empresaId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar potrero' })
    async update(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
        @Body() dto: UpdatePotreroDto,
    ) {
        return this.potrerosService.update(empresaId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar potrero' })
    async remove(
        @EmpresaActivaId() empresaId: bigint,
        @Param('id', ParseBigIntPipe) id: bigint,
    ) {
        return this.potrerosService.remove(empresaId, id);
    }
}
