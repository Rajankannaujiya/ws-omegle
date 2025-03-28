import { useEffect, useRef, useState } from "react";
import Message from "./Message/Message";
import VideoComp from "./Video";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { setShowChat } from "../store/slice";
import { AnswerMessage, IceCandidateMessage, OfferMessage, SendOfferMessage } from "./types"

export default function Room({
  name,
  localStream
}: {
  name: string | null;
  localStream:React.RefObject<MediaStream | null>;
}) {

  const showChat = useSelector((state: RootState) => state?.chatArea?.showChat);

  const dispatch = useDispatch<AppDispatch>();

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [chatButton, setChatButton] = useState(false);
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [senderPc, setSenderPc] = useState<RTCPeerConnection | null >(null);
  const [receiverPc, setReceiverPc] = useState<RTCPeerConnection | null >(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream| null>(null);


  const socketRef = useRef<WebSocket |null>(null);

  useEffect(() => {
    dispatch(setShowChat(false));
  }, []);

console.log("these are the currents",localVideoRef.current, remoteVideoRef)

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

setTimeout(()=>{
  if(!localVideoRef.current || !remoteVideoRef.current) {
    alert("no .current");
    return;
  };
})
    const ws = new WebSocket("ws://localhost:3000");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("the connection is opened")
      ws.send(JSON.stringify({ event: "join", name }));
    };

    ws.onmessage = async(event)=>{
      const message = JSON.parse(event.data);
      console.log('Received message:', message?.event);

        switch (message?.event) {
          case "send-offer":
            await handleSendOffer(message);
            break;
          case "offer":
            await handleOffer(message);
            break;
          case "answer":
            await handleAnswer(message);
            break;
          case "add-ice-candidate":
            await handleIceCandidate(message);
            break;
          case "lobby":
            setLobby(true);
            break;
        }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    setSocket(ws);

    return ()=>{
      if(ws.readyState == WebSocket.OPEN){
        ws.close();
      }

      if(senderPc){
        senderPc.close();
      }

      if(receiverPc){
        receiverPc.close();
      }
    }

  }, [name]); 


  const handleSendOffer = async(message:SendOfferMessage)=>{
    console.log("inside handlesendoffer")
    setLobby(false);
    const pc = new RTCPeerConnection();


    try {
      console.log("local stream",localStream.current)
      if(!localStream.current){
        return;
      }
      if (localStream) {
        console.log("this is the localStream",localStream);
        const stream = localStream.current
      stream?.getTracks().forEach(track => pc.addTrack(track, stream));
  }

    pc.onicecandidate =(e)=>{
      console.log(e);

      if(e.candidate){
        socketRef.current?.send(JSON.stringify({
          event: "add-ice-candidate",
          candidate: e.candidate,
          target: "sender",
          roomId: message.roomId,
      }))
      }
    }

    pc.onnegotiationneeded = async()=>{
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.send(
        JSON.stringify({
          event: "offer",
          sdp: offer,
          roomId: message.roomId,
        })
      );
    }

    setSenderPc(pc);
    } catch (error) {
      console.error("Error in handleSendOffer:", error?.message);
    }

  }


  const handleOffer = async(message:OfferMessage)=>{
    console.log("inside handle offer")
    setLobby(false);
    const pc = new RTCPeerConnection();
    const stream= new MediaStream();

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play();
    }

    pc.ontrack = (event)=>{
      console.log("+++==+++++++++++++++++++++++++++++++++++++++++++++++")
      console.log("inside the ontrack")
     try {
       if (event.streams && event.streams[0]) {
         console.log("inside the event.stream",event.streams[0])

         if (remoteVideoRef.current) {
          console.log("I am before the srcObject Ref")
           remoteVideoRef.current.srcObject = event.streams[0];
           const playPromise = remoteVideoRef.current.play();
           console.log("I am after the srcObject Ref")
           if (playPromise !== undefined) {
            console.log("I am in the srcObject Ref")
             playPromise
               .then(_ => console.log("Remote video playing"))
               .catch(err => {
                 console.log("Autoplay prevented, adding play button",err?.message);
                 // Add UI fallback for manual play
                 remoteVideoRef.current!.controls = true;
               });
           }
         }
       } else {
         stream.addTrack(event.track);
       }
     } catch (error) {
      console.log("this is the error from the the pc.ontrack", error?.message)
     }
    }

    pc.onicecandidate =(e)=>{
      console.log(e);

      if (e.candidate) {
        socketRef.current?.send(
          JSON.stringify({
            event: "add-ice-candidate",
            candidate: e.candidate,
            target: "receiver",
            roomId: message.roomId,
          })
        );
      }
    }

    pc.setRemoteDescription(message.sdp)
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.send(
        JSON.stringify({
          event: "answer",
          sdp: answer,
          roomId: message.roomId,
        })
      );

    setReceiverPc(pc);
  }


  const handleAnswer = async(message:AnswerMessage)=>{
    console.log("Inside handleAnswer")
    setLobby(false);
    if(senderPc){
      await senderPc.setRemoteDescription(message?.sdp)
    }
  }


  const handleIceCandidate = async(message:IceCandidateMessage)=>{
    try {
      console.log("inside handleIceCandidate")
      const candidate = new RTCIceCandidate(message.candidate);
      if (message.target === "sender" && receiverPc) {
        await receiverPc.addIceCandidate(candidate);
      } else if (senderPc) {
        await senderPc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      console.log(window.innerWidth);
      if (window.innerWidth <= 1100) {
        setChatButton(true);
      } else {
        setChatButton(false);
        dispatch(setShowChat(true));
      }
    };

    // Initial check
    handleResize();

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  if (lobby) {
    return <div>Waiting to connect with someone</div>;
  }


  return (
    <div className="sm:grid md:grid-cols-2 grid-cols-1 h-screen">
      {/* Left Column */}

      <div
        className={`bg-slate-300 flex items-center justify-center ${
          showChat
            ? "!flex-col "
            : !showChat
            ? "flex-col w-screen"
            : "flex-row w-screen"
        } md:flex-row lg:flex-col w-full h-full`}
      >
        <div>
        {!lobby && <VideoComp ref={localVideoRef} />}
        </div>
        <div>{!lobby && <VideoComp ref={remoteVideoRef} />} </div>
      </div>

      <button
        className="hidden sm:fixed sm:top-4 sm:right-4 sm:z-50 sm:block lg:hidden p-2 sm:bg-white sm:shadow-md sm:rounded-full"
        onClick={() => {
          dispatch(setShowChat(!showChat));
        }}
      >
        {chatButton && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
        )}
      </button>
      {/* Right Column */}
      {showChat && (
        <div className={"hidden sm:flex sm:justify-center sm:w-full sm:h-full"}>
          <Message />
        </div>
      )}
    </div>
  );
}
