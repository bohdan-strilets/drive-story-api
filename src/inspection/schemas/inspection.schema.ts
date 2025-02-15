import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImageDocument } from 'src/image/schemas/image.schema';
import { InspectionStatus } from '../enums/inspection-status.enum';

export type InspectionDocument = HydratedDocument<Inspection>;

@Schema({ versionKey: false, timestamps: true })
export class Inspection {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', default: null })
  contactId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ required: true })
  inspectionDate: Date;

  @Prop({ required: true })
  organization: string;

  @Prop({ required: true, enum: InspectionStatus })
  inspectionStatus: InspectionStatus;

  @Prop({ default: null })
  nextInspectionDate?: Date | null;

  @Prop({ default: [] })
  comments?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Image', default: null })
  photos: Types.ObjectId | ImageDocument | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InspectionSchema = SchemaFactory.createForClass(Inspection);
