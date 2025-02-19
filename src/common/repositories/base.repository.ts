import { Document, Model, Types } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: Types.ObjectId): Promise<T> {
    return this.model.findById(id);
  }

  async create<D = any>(dto: D): Promise<T> {
    return this.model.create(dto);
  }

  async updateById<D = any>(id: Types.ObjectId, dto: D): Promise<T> {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  async deleteById(id: Types.ObjectId): Promise<T> {
    return this.model.findByIdAndDelete(id);
  }
}
