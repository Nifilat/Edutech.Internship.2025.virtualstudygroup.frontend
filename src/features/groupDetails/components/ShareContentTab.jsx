import React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Square } from "lucide-react";

const ShareContentTab = () => {
  const handleShareClick = async () => {
    try {
      // This opens the browser's native screen sharing selector
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      // In a real application, you would now send this 'stream'
      // to the other participants via a WebRTC connection.
      console.log("Stream acquired:", stream);
    } catch (error) {
      console.error("Screen sharing failed or was cancelled:", error);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg leading-7 font-semibold mb-7">Share Content</h3>
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-base font-medium mb-2">
          Share Your Screen or a Window
        </h4>
        <p className="text-sm text-gray-500 mb-6">
          For security, your browser will ask you to choose which screen,
          window, or tab you'd like to share.
        </p>
        <Button
          className="bg-orange-normal text-white-normal rounded-md font-medium text-sm px-6"
          onClick={handleShareClick}
        >
          Share
        </Button>
      </div>
    </div>
  );
};

export default ShareContentTab;
