
import MessageReceived from './MessageReceived'
import MessageSend from './MessageSend'

export default function ChatArea() {
  return (
   <div className="flex flex-col h-screen">
    <MessageReceived />
    <MessageSend/>
  </div>
  )
}
