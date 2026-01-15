import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class ListOcupacionesDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  id_potrero?: string;

  @IsOptional()
  @IsString()
  id_lote?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;
}
