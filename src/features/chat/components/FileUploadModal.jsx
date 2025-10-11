import React, { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Paperclip, Album } from "@/components/icons";
import { X } from "lucide-react";

function FileUploadDropdown({ onFileSelect, disabled, children }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
    setOpen(false);
  };

  const handleMediaClick = () => {
    mediaInputRef.current?.click();
    setOpen(false);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files, type);
    }
    e.target.value = "";
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        multiple
        onChange={(e) => handleFileChange(e, "document")}
        className="hidden"
      />
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => handleFileChange(e, "media")}
        className="hidden"
      />

      {/* Dropdown Menu */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base leading-6 font-medium text-[#0A0D14]">
              Choose document
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full bg-orange-normal hover:bg-orange-normal-hover"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <DropdownMenuItem
              onClick={handleFileClick}
              className="cursor-pointer hover:bg-orange-light-hover flex items-center"
            >
              <Paperclip className="w-[18px] h-5 mr-3" fill="#0A0D14" />
              <span className="text-sm font-medium text-[#0A0D14]">
                Attach file
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMediaClick}
              className="cursor-pointer hover:bg-orange-light-hover flex items-center"
            >
              <Album className="w-[18px] h-5 mr-3" />
              <span className="text-sm font-medium text-[#0A0D14]">
                Choose photo or video
              </span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default FileUploadDropdown;
