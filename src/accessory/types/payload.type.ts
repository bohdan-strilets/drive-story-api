import { Types } from 'mongoose';
import { ItemsDto } from '../dto/items.dto';
import { ServiceDetailsDto } from '../dto/service-details.dto';
import { AccessoryType } from '../enums/accessory.type';

export type Payload = {
  carId: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  type: AccessoryType;
  price: number;
  description?: string | null;
  quantity?: number;
  serviceDetails?: ServiceDetailsDto[];
  itemsUsed?: ItemsDto[];
  totalCost?: number;
};
