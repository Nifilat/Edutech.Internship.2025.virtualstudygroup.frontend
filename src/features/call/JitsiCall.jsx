import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2 } from "lucide-react";

export const JitsiCall = ({ roomName, userDisplayName, onCallEnd, jwt }) => {
  return (
    <JitsiMeeting
      domain="meet.jit.si"
      roomName={roomName}
      jwt={jwt}
      userInfo={{
        displayName: userDisplayName,
      }}
      configOverwrite={{
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableModeratorIndicator: true,
        startScreenSharing: false,
        enableEmailInStats: false,
        prejoinPageEnabled: true,
      }}
      interfaceConfigOverwrite={{
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "participants-pane",
          "tileview",
          "fullscreen",
          "hangup",
        ],
      }}
      onApiReady={(externalApi) => {
        externalApi.on("videoConferenceLeft", onCallEnd);
      }}
      getIFrameRef={(iframeRef) => {
        iframeRef.style.height = "100%";
        iframeRef.style.width = "100%";
      }}
      spinner={() => (
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Connecting to call...</span>
        </div>
      )}
    />
  );
};
