import React from 'react';
import { Loader2 } from 'lucide-react';
import "@whereby.com/browser-sdk/embed";


export const WherebyCall = ({ roomUrl, userDisplayName, onCallEnd }) => {

  if (!roomUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading meeting room...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <whereby-embed
        displayName={userDisplayName} 
        room={roomUrl}
        background="off"
        audio="on" 
        video="on" 
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};