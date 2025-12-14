import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApprovalNotesDto } from './approval-notes.dto';

export class RejectUserDto extends ApprovalNotesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;
}
