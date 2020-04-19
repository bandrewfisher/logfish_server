import { Socket } from 'socket.io'; // eslint-disable-line no-unused-vars

export interface ConnectionInfo {
  phoneNumber?: string;
  socket: Socket;
}
class ApiKeyDictionary {
  private keysToConnectionInfo: { [key: string]: ConnectionInfo } = {};

  private socketIdToKey: { [key: string]: string } = {};

  contains(apiKey: string): boolean {
    return Object.keys(this.keysToConnectionInfo).includes(apiKey);
  }

  getSocket(apiKey: string): Socket {
    return this.keysToConnectionInfo[apiKey].socket;
  }

  getPhoneNumber(apiKey: string): string | null {
    return this.keysToConnectionInfo[apiKey].phoneNumber || null;
  }

  addConnection(apiKey: string, socket: Socket) {
    this.keysToConnectionInfo[apiKey] = {
      socket,
    };
    this.socketIdToKey[socket.id] = apiKey;
  }

  addPhoneNumber(phoneNumber: string, socket: Socket) {
    const apiKey = this.socketIdToKey[socket.id];
    this.keysToConnectionInfo[apiKey].phoneNumber = phoneNumber;
  }
}

export default new ApiKeyDictionary();
