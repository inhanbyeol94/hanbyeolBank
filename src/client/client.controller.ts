import { Body, Controller, Post } from '@nestjs/common';
import { ClientService } from './client.service';
import { IMessage } from '../_common/interfaces/message.interface';
import { CreateClientDto } from '../_common/dtos/createClient.dto';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  async createClient(@Body() newClinetData: CreateClientDto): Promise<IMessage> {
    return await this.clientService.createClient(newClinetData);
  }
}
