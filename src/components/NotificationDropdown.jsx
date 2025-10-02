import React, { useState } from "react";
import { X, Check, User } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import { studyGroupAPI } from "@/lib/api";
import { ArrowLeft } from "./icons";

const NotificationDropdown = ({ notifications, onNotificationHandled }) => {
  const [processingRequests, setProcessingRequests] = useState(new Set());

  const handleRequest = async (notification, action) => {
    const requestKey = `${notification.group_id}-${notification.user_id}`;
    if (processingRequests.has(requestKey)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestKey));

    try {
      await studyGroupAPI.handleJoinRequest(notification.group_id, {
        user_id: notification.user_id,
        action: action, // "approve" or "reject"
      });

      toast.success(
        action === "approve"
          ? "Request approved successfully"
          : "Request rejected"
      );

      // Notify parent to refresh notifications
      if (onNotificationHandled) {
        onNotificationHandled();
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${action} request. Please try again.`
      );
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-base font-semibold text-black-normal">
          Pending Request
        </h3>
        <p className="text-xs font-medium text-black-normal mt-1">
          New members need admin approval to join this group.
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {notifications && notifications.length > 0 ? (
          <>
            <p className="text-xs text-grey-dark-active font-medium mb-3">From Invite Link</p>
            <div className="space-y-3">
              {notifications.map((notification) => {
                const requestKey = `${notification.group_id}-${notification.user_id}`;
                const isProcessing = processingRequests.has(requestKey);

                return (
                  <div
                    key={requestKey}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200">
                          <User className="w-5 h-5 text-gray-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {notification.user_phone || notification.user_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          -{notification.user_initials || "User"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {notification.status === "approved" ? (
                        <span className="text-sm text-green-600">
                          Approved
                        </span>
                      ) : notification.status === "rejected" ? (
                        <span className="text-sm text-red-600">Rejected</span>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRequest(notification, "reject")}
                            disabled={isProcessing}
                            className="w-8 h-8 rounded-full hover:bg-gray-100"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            size="icon"
                            onClick={() =>
                              handleRequest(notification, "approve")
                            }
                            disabled={isProcessing}
                            className="w-8 h-8 rounded-full bg-orange-normal hover:bg-orange-normal-hover text-white"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No pending requests
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;