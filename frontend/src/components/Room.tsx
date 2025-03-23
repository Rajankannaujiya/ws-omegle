import { useEffect, useRef, useState } from "react";
import Message from "./Message/Message";
import VideoComp from "./Video";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { setShowChat } from "../store/slice";

export default function Room({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string | null;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) {
  const [chatButton, setChatButton] = useState(false);
  const [lobby, setLobby] = useState(false);
  const [visibleName, setVisibleName] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [message,setMessages] = useState<string[]>([])
  const [senderPc, setSenderPc] = useState<RTCPeerConnection | null>(null);
  const [receiverPc, setReceiverPc] = useState<RTCPeerConnection | null>(null);

  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream |null>(null)

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const socketRef = useRef<WebSocket | null>(null);


  const showChat = useSelector((state: RootState) => state?.chatArea?.showChat);


  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setShowChat(false));
  }, []);


  useEffect(() => {

    if(socketRef.current){
      return
    }

    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({ event: "join", name }));
    };


    ws.onmessage = async(event)=>{

      const message = JSON.parse(event.data);
      console.log(message?.event);

      if(message?.event === 'send-offer'){
        setLobby(false);

       const pc  = new RTCPeerConnection();
       setSenderPc(pc);

       if(localAudioTrack){
        console.log("this is the localAudioTrack",localAudioTrack)
        pc.addTrack(localAudioTrack)

       }

       if(localVideoTrack){
        console.log("this is the localVideoTrack",localVideoTrack)
        pc.addTrack(localVideoTrack)
       }

       pc.onicecandidate = async(e)=>{
        if(!e.candidate){
          return
        }
        if(e.candidate){
          // pc.addIceCandidate(e.candidate);
          ws.send(JSON.stringify({event:"add-ice-candidate", candidate:e.candidate,target:"sender", roomId:message.roomId}))
          console.log("after sending ice candidate")
        }
       }
       

       pc.onnegotiationneeded =async()=>{
        const offer = await pc.createOffer();
        pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ event: "offer", sdp:offer, roomId:message?.roomId}))
       }
      }


      else if(message?.event === 'offer'){
        console.log("inside offer")
        console.log("Received offer")

        setLobby(false);

        const pc = new RTCPeerConnection();
        await pc.setRemoteDescription(message.sdp);

        const answer = await pc.createAnswer();
  
        pc.setLocalDescription(answer);
        const stream = new MediaStream();

        if(remoteVideoRef.current){
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.play();
        }


        setRemoteMediaStream(stream)

        setReceiverPc(pc);
        // window?.pcr = pc
        pc.ontrack =  ((event)=>{
          console.log("inside on track")
          stream.addTrack(event.track)
          if (event.track.kind === "audio") {
            setRemoteAudioTrack(event.track);
          } else {
            setRemoteVideoTrack(event.track);
          }
      
          setRemoteMediaStream(stream);
        })


        pc.onicecandidate = async (e) => {
          if (!e.candidate) {
              return;
          }
          console.log("on ice candidate on receiving seide");
          if (e.candidate) {
            // pc.addIceCandidate(e.candidate)
             ws.send(JSON.stringify({event:"add-ice-candidate",
              candidate: e.candidate,
              target: "receiver",
              roomId:message?.roomId
             }))
          }
        }


        ws.send(JSON.stringify({ event: "answer", sdp:answer, roomId:message?.roomId}));

        setTimeout(() => {
          const track1 = pc.getTransceivers()[0]?.receiver.track
          const track2 = pc.getTransceivers()[1]?.receiver.track
          console.log(track1);
          if (track1.kind === "video") {
              setRemoteAudioTrack(track2)
              setRemoteVideoTrack(track1)
          } else {
              setRemoteAudioTrack(track1)
              setRemoteVideoTrack(track2)
          }

          const stream = new MediaStream();
          if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject= stream;
            remoteVideoRef.current.play();
          }
      }, 5000)


      }
      else if(message?.event === "answer"){
        setLobby(false);
        setSenderPc(pc => {
          pc?.setRemoteDescription(message?.sdp)
          return pc;
      });

      }
      else if(message?.event === 'lobby'){
        setLobby(true)
      }

      else if(message?.event=== 'add-ice-candidate'){
        console.log("add ice candidate from remote");
        console.log("message from the candidate remot", message);
        if (message?.target == "sender") {
          setSenderPc(pc => {
              if (!pc) {
                  console.error("receicng pc nout found")
              } else {
                  console.error("erro in pc ontrack",pc.ontrack)
              }
              pc?.addIceCandidate(message?.candidate)
              return pc;
          });
      } else {
          setSenderPc(pc => {
              if (!pc) {
                  console.error("sending pc out found")
              } else {
                  // console.error(pc.ontrack)
              }
              pc?.addIceCandidate(message?.candidate)
              return pc;
          });
      }
      }
    
    }

    setSocket(ws);
    // return () => ws.close();

  }, [name]);// Avoid unnecessary WebSocket reconnections


  useEffect(()=>{

    if(localVideoRef.current){
      if(localVideoTrack){
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoRef.current?.play();
      }
    }
  },[localVideoRef])


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

  if(lobby){
    return (
      <div>
        Waiting to connect with someone
      </div>
    )
  }

  console.log("local video ref is",localVideoRef?.current)

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
        {localVideoRef && <VideoComp ref={localVideoRef} />}
        {remoteVideoRef && <VideoComp ref={remoteVideoRef} />}
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
