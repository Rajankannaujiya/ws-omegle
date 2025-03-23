

export default function MessageReceived() {
  return (

<div className="flex items-start gap-2.5 justify-start">
<div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
  <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
</div>
    <div className="flex flex-col gap-1 w-full max-w-[320px]">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
         <span className="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
      </div>
      <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
         <p className="text-sm font-normal text-gray-900 dark:text-white"> That's awesome. I think our users will really appreciate the improvements.</p>
      </div>
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
   </div>
</div>
  )
}
