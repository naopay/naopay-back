import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RegisterDto } from './dto/register.dto';
import { Role } from './dto/role.enum';

@WebSocketGateway()
export class TerminalGateway {

  private readonly logger = new Logger(TerminalGateway.name);

  private terminalSocket: Socket;
  private cashierSocket: Socket;

  @SubscribeMessage('register')
  register(client: Socket, data: RegisterDto): string {
    const role = data?.role;

    if (role === Role.TERMINAL) {
      if (this.terminalSocket?.connected) {
        this.terminalSocket.disconnect()
        this.logger.log(`Disconnected terminal ${client.id}`)
      }
      this.terminalSocket = client;
      this.logger.log(`Registered terminal ${client.id}`)
      return 'ack';
    }
    
    if (role === Role.CASHIER) {
      if (this.cashierSocket?.connected) {
        this.cashierSocket.disconnect()
        this.logger.log(`Disconnected cashier ${client.id}`)
      }
      this.cashierSocket = client;
      this.logger.log(`Registered cashier ${client.id}`)
      return 'ack';
    }

    return 'error';
  }

  @SubscribeMessage('cart')
  cart(client: Socket, data: any): string {
    if (client.id === this.cashierSocket.id && this.terminalSocket.connected) {
      this.terminalSocket.emit('cart', data);
      this.logger.debug(`Updated terminal cart with data ${JSON.stringify(data)}`)
      return 'ack';
    }

    return 'error';
  }
  
  @SubscribeMessage('transaction')
  transaction(client: Socket, data: any): string {
    if (client.id === this.cashierSocket.id && this.terminalSocket.connected) {
      this.terminalSocket.emit('transaction', data);
      this.logger.debug(`Sent transaction update to terminal : ${JSON.stringify(data)}`)
      return 'ack';
    }

    return 'error';
  }
}