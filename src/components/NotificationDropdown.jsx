import React, { useState } from "react";
import { X, Check, User, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { studyGroupAPI } from "@/lib/api";
import { ArrowLeft } from "./icons";

const NotificationDropdown = ({
  notifications,
  onNotificationHandled,
  onClose,
}) => {
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const [handledRequests, setHandledRequests] = useState(new Map());

  // Filter by status - only show pending join requests
  const pendingRequests = notifications.filter(
    (notif) =>
      notif.type === "App\\Notifications\\JoinRequestNotification" &&
      notif.data.status === "pending"
  );

  // Show approved/rejected requests
  const handledRequestsList = notifications.filter(
    (notif) =>
      notif.type === "App\\Notifications\\JoinRequestNotification" &&
      (notif.data.status === "approved" || notif.data.status === "rejected")
  );

  const statusNotifications = notifications.filter(
    (notif) =>
      notif.type === "App\\Notifications\\JoinRequestStatusNotification"
  );

  const handleRequest = async (notification, action) => {
    const requestKey = `${notification.data.group_id}-${notification.data.user_id}`;
    if (processingRequests.has(requestKey)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestKey));

    try {
      await studyGroupAPI.handleJoinRequest(notification.data.request_id, {
        action,
      });

      setHandledRequests((prev) => new Map(prev).set(requestKey, action));

      toast.success(
        action === "approve"
          ? "Request approved successfully"
          : "Request rejected"
      );

      if (onNotificationHandled) {
        setTimeout(() => onNotificationHandled(), 500);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "You don't have permission to perform this action"
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${action} request. Please try again.`
        );
      }
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  };

  const hasPendingRequests = pendingRequests.length > 0;
  const hasHandledRequests = handledRequestsList.length > 0;
  const hasStatusNotifications = statusNotifications.length > 0;
  const hasAnyNotifications =
    hasPendingRequests || hasHandledRequests || hasStatusNotifications;

  return (
    <div className="w-[368px] bg-white rounded-lg p-6">
      {/* Header with Back Arrow and Title */}
      <div className=" border-b flex items-center gap-3">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <ArrowLeft className="" />
          </Button>
        )}
        <h3 className="text-lg font-semibold text-black-normal">
          {hasPendingRequests ? "Pending Requests" : "Notifications"}
        </h3>
      </div>

      {/* Pending Requests Section */}
      {hasPendingRequests && (
        <div className="border-b">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-black-normal mb-3">
              New members need admin approval to join{" "}
              {pendingRequests.length > 1 ? "these groups" : "this group"}.
            </p>
            <p className="text-xs font-medium text-grey-dark-active mb-3">
              From Invite Link
            </p>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {pendingRequests.map((notification) => {
              const requestKey = `${notification.data.group_id}-${notification.data.user_id}`;
              const isProcessing = processingRequests.has(requestKey);
              const handledStatus = handledRequests.get(requestKey);
              const isUnread = !notification.read_at;

              return (
                <div
                  key={notification.id}
                  className="flex items-center justify-between relative"
                >
                  {/* {isUnread && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-normal rounded-full"></div>
                  )} */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {notification.data.user_avatar ? (
                        <AvatarImage
                          src={notification.data.user_avatar}
                          alt={notification.data.user_name || "User"}
                        />
                      ) : null}
                      <AvatarFallback className="bg-gray-200">
                        {notification.data.user_name ? (
                          notification.data.user_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black-normal">
                        {notification.data.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {handledStatus === "approve" ? (
                      <span className="text-sm text-green-600">Approved</span>
                    ) : handledStatus === "reject" ? (
                      <span className="text-sm text-red-600">Rejected</span>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRequest(notification, "reject")}
                          disabled={isProcessing}
                          className="w-8 h-8 rounded-full border-orange-light-active border hover:bg-gray-100"
                        >
                          <X className="w-4 h-4 text-black-normal" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={() => handleRequest(notification, "approve")}
                          disabled={isProcessing}
                          className="w-8 h-8 rounded-full bg-orange-normal hover:bg-orange-normal-hover text-white"
                        >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Handled Requests (Approved/Rejected) */}
      {hasHandledRequests && (
        <div className="border-b px-4 py-3 space-y-3">
          {handledRequestsList.map((notification) => {
            const isApproved = notification.data.status === "approved";
            const isUnread = !notification.read_at;

            return (
              <div
                key={notification.id}
                className="flex items-center justify-between relative"
              >
                {/* {isUnread && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                )} */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    {notification.data.user_avatar ? (
                      <AvatarImage
                        src={notification.data.user_avatar}
                        alt={notification.data.user_name || "User"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-200">
                      {notification.data.user_name ? (
                        notification.data.user_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black-normal">
                      {notification.data.message}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-medium ${
                    isApproved ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isApproved ? "Approved" : "Rejected"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Notifications Section */}
      {hasStatusNotifications && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Notifications
          </h4>
          <div className="space-y-2">
            {statusNotifications.map((notification) => {
              const isApproved = notification.data.status === "approved";
              const isRejected = notification.data.status === "rejected";

              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg text-sm ${
                    notification.read_at
                      ? "bg-gray-50"
                      : isApproved
                      ? "bg-green-50"
                      : isRejected
                      ? "bg-red-50"
                      : "bg-orange-50"
                  }`}
                >
                  <p
                    className={`${
                      notification.read_at
                        ? "text-gray-600"
                        : isApproved
                        ? "text-green-900"
                        : isRejected
                        ? "text-red-900"
                        : "text-gray-900"
                    }`}
                  >
                    {notification.data.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasPendingRequests && !hasStatusNotifications && (
        <div className="p-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
