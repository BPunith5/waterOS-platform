import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe:device')
  subscribeDevice(@ConnectedSocket() socket: Socket, @MessageBody() deviceId: string) {
    socket.join(`device:${deviceId.toUpperCase()}`);
  }

  @SubscribeMessage('unsubscribe:device')
  unsubscribeDevice(@ConnectedSocket() socket: Socket, @MessageBody() deviceId: string) {
    socket.leave(`device:${deviceId.toUpperCase()}`);
  }

  @SubscribeMessage('subscribe:tank')
  subscribeTank(@ConnectedSocket() socket: Socket, @MessageBody() tankId: string) {
    socket.join(`tank:${tankId}`);
  }

  @SubscribeMessage('unsubscribe:tank')
  unsubscribeTank(@ConnectedSocket() socket: Socket, @MessageBody() tankId: string) {
    socket.leave(`tank:${tankId}`);
  }

  emitDeviceUpdate(deviceId: string, tankId: Types.ObjectId | null, payload: unknown) {
    this.server.to(`device:${deviceId.toUpperCase()}`).emit('device:update', payload);
    if (tankId) this.server.to(`tank:${tankId.toString()}`).emit('device:update', payload);
  }

  emitAlert(deviceId: string, tankId: Types.ObjectId | null, alert: unknown) {
    this.server.to(`device:${deviceId.toUpperCase()}`).emit('alert:new', alert);
    if (tankId) this.server.to(`tank:${tankId.toString()}`).emit('alert:new', alert);
  }
}
