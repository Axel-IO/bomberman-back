import {
  ConnectedSocket,
  MessageBody,
  OnConnect,
  OnDisconnect,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";
import { initBoard } from "../gameLogic/board";
import { Square } from "../gameLogic/type";
import { Player } from "./type";

@SocketController()
export class MainController {
  public socketList: Socket[];
  public players: Record<string, Player>;
  public board: Square[][];

  constructor() {
    this.socketList = []
    this.players = {}
    this.board = initBoard(10, 20);
  }

  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("New Socket connected: ", socket.id);

    this.socketList.push(socket);
    this.players[socket.id] = {
      x: 50,
      y: 50,
      size: 20,
      speed: 5,
      color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
    };
    socket.emit("init_board", this.board);

    setInterval(() => {
      socket.emit("update_players", this.players);
    }, 1000 / 60);

    socket.on("custom_event", (data: any) => {
      console.log("Data: ", data);
    });
  }

  @OnDisconnect()
  public onDisconnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("Socket disconnected: ", socket.id);

    delete this.players[socket.id];
  }

  @OnMessage("move_player")
  public movePlayer(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    body: { maxWidth: number; maxHeight: number; direction: string }
  ) {
    this.moveOnePlayer(body, this.players[socket.id]);
    socket.emit("update_players", this.players);
  }

  public moveOnePlayer({ direction, maxWidth, maxHeight }, player) {
    if (direction == "UP") player.y -= player.speed;
    if (direction == "DOWN") player.y += player.speed;
    if (direction == "LEFT") player.x -= player.speed;
    if (direction == "RIGHT") player.x += player.speed;

    const borderSize = player.size / 2;
    if (player.y - borderSize <= 0) player.y = borderSize;
    if (player.y + borderSize >= maxHeight) player.y = maxHeight - borderSize;
    if (player.x - borderSize <= 0) player.x = borderSize;
    if (player.x + borderSize >= maxWidth) player.x = maxWidth - borderSize;
  }
}
