import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BulkAssignAnimalsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  id_animal: string[];
}
