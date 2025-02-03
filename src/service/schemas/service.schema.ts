import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Car } from 'src/car/schemas/car.schema';
import { User } from 'src/user/schemes/user.schema';
import { ServiceType } from '../enums/service-type.enum';
import { Status } from '../enums/status.enum';
import { Parts, PartsDocument } from './parts.schema';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ versionKey: false, timestamps: true })
export class Service {
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

  @Prop({ default: ServiceType.MAINTENANCE, enum: ServiceType })
  serviceType: ServiceType;

  @Prop({ default: Status.PENDING, enum: Status })
  status: Status;

  @Prop({ default: 0 })
  costEstimate: number;

  @Prop({ default: null })
  description?: string | null;

  @Prop({ default: null })
  completionDate?: Date | null;

  @Prop({ type: Parts, default: null })
  partsUsed: PartsDocument | null;

  @Prop({ default: null })
  startDate?: Date | null;

  @Prop({ default: null })
  endDate?: Date | null;

  @Prop()
  documentPhotos: any;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
