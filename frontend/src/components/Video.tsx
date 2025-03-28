import { forwardRef, ComponentProps, LegacyRef } from "react";

const VideoComp = forwardRef<HTMLVideoElement, ComponentProps<"video">>(
  (props, ref) => {
    // @ts-ignore
    console.log("the ref is ref",ref?.current)
    return (
      <div className="flex flex-wrap justify-center items-center m-2">
        <video
          preload="none"
          autoPlay
          {...props}
          className="w-full md:w-full max-w-screen-md rounded-lg object-contain"
          controls
          playsInline
          ref={ref as LegacyRef<HTMLVideoElement>} // Explicit type assertion
        />
      </div>
    );
  }
);

export default VideoComp;