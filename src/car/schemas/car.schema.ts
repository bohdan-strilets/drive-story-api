import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemes/user.schema';
import { BasicInfo } from './basic-info.schema';
import { Images } from './images.schema';
import { Ownership } from './ownership.schema';
import { Registration } from './registration.schema';
import { Specifications } from './specifications.schema';

export type CarDocument = HydratedDocument<Car>;

@Schema({ versionKey: false, timestamps: true })
export class Car {
  @Prop({ default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: BasicInfo })
  basicInfo: BasicInfo;

  @Prop({ type: Specifications })
  specifications: Specifications;

  @Prop({ type: Registration })
  registration: Registration;

  @Prop({ type: Ownership })
  ownership: Ownership;

  @Prop({ default: null })
  description: string | null;

  @Prop({ type: Images })
  images: Images;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CarSchema = SchemaFactory.createForClass(Car);
