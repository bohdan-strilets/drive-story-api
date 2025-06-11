import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OwnershipDocument = HydratedDocument<Ownership>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Ownership {
  @Prop({ default: null })
  purchaseDate?: Date | null;

  @Prop({ default: null })
  saleDate?: Date | null;

  @Prop({ default: 0 })
  purchasePrice?: number;

  @Prop({ default: 0 })
  salePrice?: number;
}
