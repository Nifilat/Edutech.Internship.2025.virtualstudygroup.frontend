import React, { useEffect, useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  Reply,
  Copy,
  Pin,
  Trash2,
  Share,
  CheckSquare,
  Plus,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const menuItems = [
  { label: "Reply", icon: Reply, action: "reply" },
  { label: "Copy", icon: Copy, action: "copy" },
  { label: "Pin", icon: Pin, action: "pin" },
  { label: "Delete", icon: Trash2, action: "delete", color: "text-red-500" },
  { type: "divider" },
  { label: "Share", icon: Share, action: "share" },
  { label: "Select", icon: CheckSquare, action: "select" },
];

const emojiReactions = ["❤️", "😂", "🙏", "😢", "😮"];

export const MessageContextMenu = ({
  message,
  position,
  onClose,
  onAction,
  onReact,
}) => {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ x: position.x, y: position.y });

  // Close the menu if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Reposition to keep the menu within viewport bounds
  useEffect(() => {
    const adjustPosition = () => {
      const menuEl = menuRef.current;
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();
      const margin = 8;
      let x = position.x;
      let y = position.y;

      if (x + rect.width > window.innerWidth - margin) {
        x = Math.max(margin, window.innerWidth - rect.width - margin);
      }
      if (y + rect.height > window.innerHeight - margin) {
        y = Math.max(margin, window.innerHeight - rect.height - margin);
      }
      if (x !== coords.x || y !== coords.y) {
        setCoords({ x, y });
      }
    };
    // Run after mount and on resize/scroll
    adjustPosition();
    window.addEventListener("resize", adjustPosition);
    window.addEventListener("scroll", adjustPosition, true);
    return () => {
      window.removeEventListener("resize", adjustPosition);
      window.removeEventListener("scroll", adjustPosition, true);
    };
  }, [position.x, position.y, coords.x, coords.y]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-56 bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{ top: coords.y, left: coords.x }}
    >
      <ul className="p-2">
        {menuItems.map((item, index) => {
          if (item.type === "divider") {
            return <hr key={index} className="my-1" />;
          }
          return (
            <li key={item.label}>
              <button
                className={`w-full flex items-center gap-4 text-left p-2 rounded hover:bg-gray-100 ${
                  item.color || "text-gray-700"
                }`}
                onClick={() => {
                  onAction(item.action, message);
                  onClose();
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-around p-2 bg-gray-50 border-t relative">
        {emojiReactions.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {onReact(emoji, message); onClose();}}
            className="p-1 text-2xl rounded-full hover:bg-gray-200 transition-transform transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-200">
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-0">
            <Picker
              data={data}
              onEmojiSelect={(emoji) => {
                onReact(emoji.native, message);
                onClose();
              }}
              theme="light"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
