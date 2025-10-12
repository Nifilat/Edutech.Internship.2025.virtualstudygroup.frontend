import React from "react";
import { File } from "lucide-react";

const FilesTab = () => (
  <div className="p-6 text-center">
    <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900">No saved files</h3>
    <p className="mt-1 text-sm text-gray-500">
      Documents and files shared in this chat will appear here.
    </p>
  </div>
);

export default FilesTab;
