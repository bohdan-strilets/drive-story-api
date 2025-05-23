import { IsBoolean } from 'class-validator';

export class PaidStatusDto {
  @IsBoolean({ message: 'isPaid must be a boolean value.' })
  isPaid: boolean;
}
