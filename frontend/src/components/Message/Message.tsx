
import ChatArea from "./ChatArea"
import InputComp from "./InputComp"

function Message() {


  return (
    <div className="max-h-screen max-w-screen bg-gray-400 p-4 flex w-full flex-col">
      <div>
        <ChatArea />
      </div>
    <div className="flex justify-center relative">
      <InputComp />
    </div>
    </div>


  )
}

export default Message