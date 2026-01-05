import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class UserRoleUpdateDto {
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  rol_id: string;
}
