import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class FincaListDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  empresa_id?: string;
}
