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
  @Prop()
  mileage: number;

  @Prop({ default: FuelType.NOT_SELECTED, enum: FuelType })
  fuelType: FuelType;

  @Prop({ default: Transmission.NOT_SELECTED, enum: Transmission })
  transmission: Transmission;

  @Prop({ default: Drivetrain.NOT_SELECTED, enum: Drivetrain })
  drivetrain: Drivetrain;

  @Prop({ default: Drivetrain.NOT_SELECTED, enum: Drivetrain })
  bodyType: BodyType;

  @Prop({ type: Engine })
  engine: Engine;

  @Prop()
  color: string;

  @Prop()
  doors: number;

  @Prop()
  seats: number;
}
