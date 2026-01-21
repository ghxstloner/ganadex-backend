import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BulkRemoveAnimalsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  animal_ids: string[];
}
