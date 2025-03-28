import { Types } from 'mongoose';
import { EntityType } from '../enums/entity-type.enum';

export type Payload = {
  owner: Types.ObjectId;
  entityId: Types.ObjectId;
  entityType: EntityType;
  default: string;
  resources: string[];
  selected: string;
};
