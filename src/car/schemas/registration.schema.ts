import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Registration {
  @Prop({ default: null })
  vin?: string | null;

  @Prop({ default: null })
  regNumber?: string | null;

  @Prop({ default: null })
  firstRegDate?: Date | null;
}
