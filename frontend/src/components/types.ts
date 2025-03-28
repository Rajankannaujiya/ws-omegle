interface BaseMessage {
    event: string;
    roomId?: string;
  }
  
  export interface JoinMessage extends BaseMessage {
    event: "join";
    name: string;
  }
  
  export interface OfferMessage extends BaseMessage {
    event: "offer";
    sdp: RTCSessionDescriptionInit;
  }
  
  export interface AnswerMessage extends BaseMessage {
    event: "answer";
    sdp: RTCSessionDescriptionInit;
  }
  
  export interface IceCandidateMessage extends BaseMessage {
    event: "add-ice-candidate";
    candidate: RTCIceCandidateInit;
    target: "sender" | "receiver";
  }
  
  export interface LobbyMessage extends BaseMessage {
    event: "lobby";
  }
  
  export interface SendOfferMessage extends BaseMessage {
    event: "send-offer";
  }
  
  export type WebRTCMessage = 
    | JoinMessage
    | OfferMessage
    | AnswerMessage
    | IceCandidateMessage
    | LobbyMessage
    | SendOfferMessage;