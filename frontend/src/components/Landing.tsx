import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Room from "./Room";
import VideoComp from "./Video";

export default function Landing() {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null)
  const [joined, setJoined] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null)

  const navigate = useNavigate();


  // getting the camera and audio of the user
  const getUserCamera = async()=>{
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    })

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack);

    if(videoRef && videoRef.current){
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      videoRef.current.play();
    }


  }
  useEffect(()=>{

    if(videoRef && videoRef.current){
      getUserCamera();
    }
  },[])

  console.log("this is the name from the landing page",name);

  if(!joined){
  return (
    <div className="h-screen flex items-center justify-center w-screen flex-col">
      <VideoComp ref={videoRef} />;
      <div className="flex flex-col justify-center w-1/2 m-2 p-2">
        <label
          htmlFor="first_name"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Your Name
        </label>
        <input
          onChange={(e) => {
            setName(e.target.value);
          }}
          type="text"
          id="first_name"
          className="bg-gray-50 border m-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Enter your Name"
          required
        />
      </div>

      <button
        onClick={() => {
          // join room logic here
          setJoined(true);
          navigate("/room");
        }}
        type="button"
        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
      >
        Join room
      </button>
    </div>
  );
}

return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
}
