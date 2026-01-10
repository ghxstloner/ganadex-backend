import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryLoteDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  solo_activos?: boolean;
}
