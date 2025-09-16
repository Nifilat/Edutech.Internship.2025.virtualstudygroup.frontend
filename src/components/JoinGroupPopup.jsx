import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const JoinGroupPopup = ({ isOpen, onClose, onCancelRequest }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0" showCloseButton={false}>
        <div className="bg-white rounded-lg p-6 text-center">
          {/* Header with close button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center justify-between w-full">
              
              <h2 className="text-base font-medium text-black">Request Sent</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-orange-normal rounded-full flex items-center justify-center text-white hover:bg-orange-normal-hover transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-black mb-6 leading-relaxed">
            You will be added once the admin approves your request
          </p>

          {/* Cancel button */}
          <Button
            onClick={onCancelRequest}
            className="bg-orange-normal hover:bg-orange-normal-hover text-white-normal text-sm px-3 py-0.5 rounded-md font-medium"
          >
            Cancel request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupPopup;