import React from "react";
import { Image } from "lucide-react";

const MediaTab = () => (
  <div className="p-6 text-center">
    <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900">No media found</h3>
    <p className="mt-1 text-sm text-gray-500">
      Photos and videos shared in this chat will appear here.
    </p>
  </div>
);

export default MediaTab;
