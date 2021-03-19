import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RegisterDto } from './dto/register.dto';
import { Role } from './dto/role.enum';

@WebSocketGateway()
export class TerminalGateway {

  private terminalSocket: Socket;
  private cashierSocket: Socket;

  @SubscribeMessage('register')
  register(client: Socket, data: RegisterDto): string {
    const role = data?.role;

    if (role === Role.TERMINAL) {
      this.terminalSocket = client;
      return 'ack';
    }
    
    if (role === Role.CASHIER) {
      this.cashierSocket = client;
      return 'ack';
    }

    return 'error';
  }

  @SubscribeMessage('cart')
  cart(client: Socket, data: any): string {
    if (client.id === this.cashierSocket.id && this.terminalSocket.connected) {
      this.terminalSocket.emit('cart', data);
      return 'ack';
    }

    return 'error';
  }
  
}