import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';

export class ContactRepository {
  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {}

  async findContactById(contactId: Types.ObjectId): Promise<ContactDocument> {
    return this.contactModel.findById(contactId).populate('photos');
  }

  async findContactByPhoneOrName(
    name: string,
    phone: string,
  ): Promise<ContactDocument> {
    return this.contactModel.findOne({ name, phone }).populate('photos');
  }

  async findAllContactsByUser(
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<ContactDocument[]> {
    return await this.contactModel
      .find({ owner: userId })
      .skip(skip)
      .limit(limit)
      .populate('photos');
  }

  async findAndCountContacts(
    userId: Types.ObjectId,
    skip: number,
    limit: number,
  ): Promise<{ items: ContactDocument[]; totalItems: number }> {
    const filter = { owner: userId };

    const [items, totalItems] = await Promise.all([
      this.contactModel.find(filter).skip(skip).limit(limit).populate('photos'),
      this.contactModel.countDocuments(filter),
    ]);

    return { items, totalItems };
  }

  async createContact(payload: any) {
    return this.contactModel.create(payload);
  }

  async updateContact(
    contactId: Types.ObjectId,
    dto: any,
  ): Promise<ContactDocument> {
    return this.contactModel
      .findByIdAndUpdate(contactId, dto, { new: true })
      .populate('photos');
  }

  async deleteContact(contactId: Types.ObjectId): Promise<ContactDocument> {
    return this.contactModel.findByIdAndDelete(contactId).populate('photos');
  }

  async setImage(
    contactId: Types.ObjectId,
    data: Types.ObjectId | null,
  ): Promise<ContactDocument> {
    await this.findContactById(contactId);
    return await this.updateContact(contactId, { photos: data });
  }

  async filterByNameOrPhone(
    userId: Types.ObjectId,
    regex: RegExp,
    skip: number,
    limit: number,
  ): Promise<{ items: ContactDocument[]; totalItems: number }> {
    const filter = {
      owner: userId,
      $or: [{ name: { $regex: regex } }, { phone: { $regex: regex } }],
    };

    const [items, totalItems] = await Promise.all([
      this.contactModel.find(filter).skip(skip).limit(limit).populate('photos'),
      this.contactModel.countDocuments(filter),
    ]);

    return { items, totalItems };
  }
}
