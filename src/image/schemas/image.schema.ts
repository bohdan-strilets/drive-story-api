import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityType } from '../enums/entity-type.enum';

export type ImageDocument = HydratedDocument<Image>;

@Schema({ versionKey: false })
export class Image {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ enum: EntityType, required: true })
  entityType: EntityType;

  @Prop({ required: true })
  default: string;

  @Prop({ type: [String], default: [] })
  resources: string[];

  @Prop({ required: true })
  selected: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
