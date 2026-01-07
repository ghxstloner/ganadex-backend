import { IsString, IsOptional, IsDateString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryEventoSanitarioDto extends QueryPaginationDto {
    @IsOptional()
    @IsString()
    id_animal?: string;

    @IsOptional()
    @IsString()
    id_enfermedad?: string;

    @IsOptional()
    @IsDateString()
    fecha_desde?: string;

    @IsOptional()
    @IsDateString()
    fecha_hasta?: string;
}
