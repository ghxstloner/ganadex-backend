import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class FincaListDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  empresa_id?: string;
}
