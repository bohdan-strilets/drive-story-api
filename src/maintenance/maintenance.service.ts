import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { defaultImages } from 'src/cloudinary/helpers/default-images';
import { ResponseService } from 'src/response/response.service';
import { ApiResponse } from 'src/response/types/api-response.type';
import { MaintenanceDto } from './dto/maintenance.dto';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
    private readonly responseService: ResponseService,
  ) {}

  async addMaintenance(
    userId: Types.ObjectId,
    carId: Types.ObjectId,
    dto: MaintenanceDto,
  ): Promise<ApiResponse<MaintenanceDocument>> {
    const data = {
      carId,
      owner: userId,
      photos: {
        default: defaultImages.NOT_IMAGE,
        selected: defaultImages.NOT_IMAGE,
      },
      ...dto,
    };

    const newMaintenance = await this.maintenanceModel.create(data);
    return this.responseService.createSuccessResponse(
      HttpStatus.CREATED,
      newMaintenance,
    );
  }
}
