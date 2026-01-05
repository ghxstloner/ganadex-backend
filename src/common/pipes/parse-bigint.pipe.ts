import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string) {
    try {
      return BigInt(value);
    } catch {
      throw new UnprocessableEntityException('id invalido');
    }
  }
}
