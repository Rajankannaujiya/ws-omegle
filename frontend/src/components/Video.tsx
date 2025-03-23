import { forwardRef, ComponentProps } from "react";

const VideoComp = forwardRef<HTMLVideoElement, ComponentProps<"video">>(
  (props, ref) => {
    return (
      <div className="flex flex-wrap justify-center items-center m-2">
        <video preload="none"
          autoPlay
          {...props} // Spread all props to support standard <video> attributes
          className="w-full md:w-full max-w-screen-md rounded-lg object-contain"
          controls
          ref={ref}
        />
      </div>
    );
  }
);

export default VideoComp;
