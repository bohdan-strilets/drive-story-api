import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ReminderDto {
  @IsNotEmpty({ message: 'Reminder title should not be empty' })
  @IsString({ message: 'Title must be a string' })
  @Length(1, 100, {
    message: 'Title must be between 1 and 100 characters long',
  })
  title: string;

  @IsNotEmpty({ message: 'Reminder date is required' })
  @IsDateString(
    { strict: true },
    { message: 'Reminder date must be a valid ISO date string' },
  )
  reminderDate: string;

  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  @Length(0, 500, { message: 'Message must be at most 500 characters long' })
  message?: string | null;
}
