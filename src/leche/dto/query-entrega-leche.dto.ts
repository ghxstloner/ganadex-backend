import { IsString, IsOptional, IsDateString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryEntregaLecheDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  id_centro?: string;

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
