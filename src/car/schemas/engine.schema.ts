import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EngineDocument = HydratedDocument<Engine>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Engine {
  @Prop({ default: 0 })
  volume: number;

  @Prop({ default: 0 })
  power: number;
}
