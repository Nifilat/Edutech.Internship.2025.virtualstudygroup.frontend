import React, { useEffect, useRef, useState } from "react";
import {
  Reply,
  Copy,
  Forward,
  Star,
  Pin,
  Trash2,
  Share,
  CheckSquare,
} from "lucide-react";

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
}) => {
  const menuRef = useRef(null);
  const [showFullPicker, setShowFullPicker] = useState(false);

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

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-56 bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{ top: position.y, left: position.x }}
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
      <div className="flex items-center justify-around p-2 bg-gray-50 border-t">
        {emojiReactions.map((emoji) => (
          <button
            key={emoji}
            className="p-1 text-2xl rounded-full hover:bg-gray-200 transition-transform transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
