import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BodyType } from '../enums/body-type.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel.type.enum';
import { Transmission } from '../enums/transmission.enum';
import { Engine } from './engine.schema';

export type SpecificationsDocument = HydratedDocument<Specifications>;

@Schema({ versionKey: false, timestamps: false, _id: false })
export class Specifications {
  @Prop({ default: 0 })
  mileage: number;

  @Prop({ default: FuelType.NOT_SELECTED, enum: FuelType })
  fuelType: FuelType;

  @Prop({ default: Transmission.NOT_SELECTED, enum: Transmission })
  transmission: Transmission;

  @Prop({ default: Drivetrain.NOT_SELECTED, enum: Drivetrain })
  drivetrain: Drivetrain;

  @Prop({ default: BodyType.NOT_SELECTED, enum: BodyType })
  bodyType: BodyType;

  @Prop({ type: Engine })
  engine: Engine;

  @Prop({ default: null })
  color?: string | null;

  @Prop({ default: 0 })
  doors?: number;

  @Prop({ default: 0 })
  seats?: number;
}
