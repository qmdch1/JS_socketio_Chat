# webSocket 라이브러리인 socket.io를 이용하여 채팅방을 만들어보겠습니다.
서버 런타임
```
npm i
npm run start

# npm run start 명령어 입력시, dist폴더에 빌드 되는데, main.js를 실행하면 됨
node dist/main.js
```

접속
```
http://localhost:3000
```

<br><br>

socket.io를 사용하는 이유
```
재접속, 브로드캐스팅, 멀티플랙싱(채팅방: namespace) 기능을 제공
웹소켓을 지원하며, 웹소켓을 지원하지 않는 브라우저에서는 롱폴링 방식을 사용한 통신을 지원
```
<br>

용어 정리
```
gateway
  HTTP통신은 Controller에서 관리하지만,
  WebSocket통신은 Gateway에서 관리합니다.
```

```
# app.gateway
@WebSocketGateway({ namespace: 'chat'})
  게이트웨이 생성 어노테이션이며, namespace를 이용한 채팅방(멀티플렉싱)기능을 제공한다.
  위 어노테이션은 chat 이라는 채팅방을 관리한다는 의미이다

# @WebSocketServer() server: Server;
  웹 소켓의 인스턴스를 생성한다.
  직접 웹소켓 서버의 인스턴스를 생성하는 것이 아니기 때문에, 웹소켓 인스턴스의 접근은 @WebSocketServer()를 이용해서 접근해야한다.

# @SubscribeMessage('createRoom')
  createRoom에 대한 이벤트를 구독하는 리스너이다.
  위에서 @WebSocketGateway에 namespace가 설정되어 있는 경우, 해당 채팅방의 createRoom 이벤트를 수신한다.

# emit
  방출한다는 의미이다. 웹소켓에 연결된 클라이언트들에게 메시지를 뿌린다.
  server.emit('<이벤트>', 값); : 자기자신을 포함한 모든 클라이언트들에게 메시지 방출
  <socket>.broadcast.emit('<이벤트>', 값); : 전송을 요청한 클라이언트를 제외한 클라이언트들에게 메시지 방출
  <socket>.broadcast.to(room).emit('<이벤트>', 값); : 전송을 요청한 클라이언트를 제외한 특정 채팅방(room)에 접속한 모든 클라이언트들에게 메시지 방출
```

```
index.html

const socket = io('http://localhost:3000/chat');
const roomSocket = io('http://localhost:3000/room');

socket.connect();
socket.disconnect();

socket.on('connect', () => {})
socket.on('message', (message) => {})
socket.on('notice',(data => {})

```

```
main.ts 
# static 폴더에 정적 파일들을 경로지정 해준다.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'static')); // 정적 파일 경로 지정
  await app.listen(3000);
}
bootstrap();
```


<br>

설치
```
# nestjs
  npm i @nestjs/cli
  nest new <프로젝트명>

# socket.io
  npm i @nestjs/websockets @nestjs/platform-socket.io
  npm i -D @types/socket.io

# socket.io의 게이트웨이 생성
  nest g gateway chat
```

<br>

구조
```
static/index.html : 채팅방 등록, 조회, 채팅 html
static/script.js : index.html의 채팅방 관련 js 함수 모음

src/chat/chat.gateway.ts : WebSocket 관련 게이트웨이(mvc의 Controller 기능)
src/app.module.ts : nestjs의 모듈 관련 소스며, 게이트웨이를 등록 해준다.
```

<br><br><br><br><br><br>
출처 - Node.js 백엔드 개발자 되기 (저자 : 박승규)