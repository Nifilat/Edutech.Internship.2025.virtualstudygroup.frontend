import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, CheckCircle } from 'lucide-react';

const JoinGroupPopup = ({ isOpen, onClose, onCancelRequest }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0" showCloseButton={false}>
        <div className="bg-white rounded-lg p-6 text-center">
          {/* Header with close button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="w-10 h-10 bg-orange-normal rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-black-normal">Request Sent</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-orange-normal rounded-full flex items-center justify-center text-white hover:bg-orange-normal-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            You will be added once the admin approves your request
          </p>

          {/* Cancel button */}
          <Button
            onClick={onCancelRequest}
            className="bg-orange-normal hover:bg-orange-normal-hover text-white px-6 py-2 rounded-md font-medium"
          >
            Cancel request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupPopup;