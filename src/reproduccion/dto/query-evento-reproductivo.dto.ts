import { IsString, IsOptional, IsDateString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryEventoReproductivoDto extends QueryPaginationDto {
    @IsOptional()
    @IsString()
    id_animal?: string;

    @IsOptional()
    @IsString()
    id_tipo?: string;

    @IsOptional()
    @IsDateString()
    fecha_desde?: string;

    @IsOptional()
    @IsDateString()
    fecha_hasta?: string;
}
