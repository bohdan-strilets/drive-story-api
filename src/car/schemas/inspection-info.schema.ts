import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InspectionInfoDocument = HydratedDocument<InspectionInfo>;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class InspectionInfo {
  @Prop({ type: Types.ObjectId, ref: 'Inspection', default: null })
  inspectionId?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  inspectionEnds?: Date | null;
}
