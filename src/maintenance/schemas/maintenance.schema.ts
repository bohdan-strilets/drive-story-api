import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Car } from 'src/car/schemas/car.schema';
import { User } from 'src/user/schemes/user.schema';
import { MaintenanceType } from '../enums/maintenance-type.enum';
import { ProcessStatus } from '../enums/process-status.enum';
import { Parts, PartsDocument } from './parts.schema';
import { Photos } from './photo.schema';

export type MaintenanceDocument = HydratedDocument<Maintenance>;

@Schema({ versionKey: false, timestamps: true })
export class Maintenance {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Car;

  // @Prop({ type: Types.ObjectId, ref: 'Contact', required: true })
  // contactId: Contact;

  // @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  // repairLocationId: Location;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ required: true, enum: MaintenanceType })
  serviceType: MaintenanceType;

  @Prop({ default: ProcessStatus.PENDING, enum: ProcessStatus })
  processStatus: ProcessStatus;

  @Prop({ default: 0 })
  costEstimate: number;

  @Prop({ default: null })
  description?: string | null;

  @Prop({ default: null })
  completionDate?: Date | null;

  @Prop({ type: [Parts], default: [] })
  partsUsed: PartsDocument[];

  @Prop({ default: null })
  startDate?: Date | null;

  @Prop({ default: null })
  endDate?: Date | null;

  @Prop({ type: Photos })
  photos: Photos;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);
