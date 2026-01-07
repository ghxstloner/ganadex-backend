import { IsOptional, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryAnimalDto extends QueryPaginationDto {
    @IsOptional()
    @IsString()
    id_finca?: string;

    @IsOptional()
    @IsString()
    id_lote?: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    sexo?: 'M' | 'F';

    @IsOptional()
    @IsString()
    id_categoria?: string;

    @IsOptional()
    @IsString()
    id_estado?: string;

    @IsOptional()
    @IsString()
    id_raza?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    solo_activos?: boolean;
}
