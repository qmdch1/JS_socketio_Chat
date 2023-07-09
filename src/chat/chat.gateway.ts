import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat'})
export class ChatGateway {
  @WebSocketServer() server: Server; // 웹소켓 서버 인스턴스 선언

  @SubscribeMessage('message') // message이벤트 구독
  handleMessage(client: Socket, payload: any): void {
    const{message, nickname} = payload;
    
    // 접속한 클라이언트 들에 메시지 전송 (나를 포함한 모든 인원에게 전송)
    //this.server.emit('message', `client-${client.id.substring(0, 4)} : ${payload}`,);

    // 닉네임을 포함한 메시지 전송 (나를 제외한 모든 인원에게 전송)
    client.broadcast.emit('message', `${nickname} : ${message}`);
  }
}

@WebSocketGateway({ namespace: 'room'})
export class RoomGateway{
  constructor(private readonly chatGateway: ChatGateway){}
  rooms = [];

  @WebSocketServer() server: Server;

  // 채팅방이 만들어졌을때 이벤트
  @SubscribeMessage('createRoom')
  handleMessage(@MessageBody() data){
    const { nickname, room } = data;
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room}방을 만들었습니다.`,
    })
    this.rooms.push(room);
    this.server.emit('rooms', this.rooms);
  }

  // 채팅방에 누가 접속 했을때 이벤트
  @SubscribeMessage('joinRoom')
  handleJoinRoom(socket: Socket, data){
    const { nickname, room, toLeaveRoom } = data;
    socket.leave(toLeaveRoom);
    this.chatGateway.server.emit('notice', {
      message: `${nickname}님이 ${room}방에 입장했습니다. `,
    });
    socket.join(room);
  }

  // 채팅방에서 누가 채팅 했을때 이벤트
  @SubscribeMessage('message')
  handleMessageToRoom(socket: Socket, data){
    const { nickname, room, message } = data;
    console.log(data);
    socket.broadcast.to(room).emit('message', {
      message: `${nickname}: ${message}`,
    });
  }

}
