import { IsString, IsOptional, IsDateString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryMovimientoDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_animal?: string;

  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  id_lote?: string;

  @IsOptional()
  @IsString()
  id_motivo?: string;

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
