import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BulkAssignAnimalsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  animal_ids: string[];
}
