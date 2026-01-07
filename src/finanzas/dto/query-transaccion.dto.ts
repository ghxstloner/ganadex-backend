import { IsString, IsOptional, IsDateString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryTransaccionDto extends QueryPaginationDto {
    @IsOptional()
    @IsString()
    id_tipo?: string;

    @IsOptional()
    @IsString()
    id_categoria?: string;

    @IsOptional()
    @IsDateString()
    fecha_desde?: string;

    @IsOptional()
    @IsDateString()
    fecha_hasta?: string;
}
