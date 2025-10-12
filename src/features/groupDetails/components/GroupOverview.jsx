import React from "react";
import { Button } from "@/components/ui/button";
import { UserGroup } from "@/components/icons";
import { Pencil } from "lucide-react";

const GroupOverview = ({ groupData, onEditName, onEditDescription }) => (
  <div className="p-6">
    <div className="text-center mb-6">
      <UserGroup className="w-16 h-16 mx-auto" />
      <div className="flex items-center justify-center mt-4">
        <h3 className="text-lg font-semibold text-black-normal">
          {groupData.name}
        </h3>
        <Button variant="ghost" size="icon" onClick={onEditName}>
          <Pencil className="w-3.5 h-3.5 text-black-normal" />
        </Button>
      </div>
    </div>
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-black-normal">Created</p>
        <div className="flex gap-3 text-sm font-medium text-black-normal">
          <p className="">{groupData.createdAtDate}</p>
          <p className="">{groupData.createdAtTime}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-black-normal">Description</p>

        <div className="flex items-center">
          <p className="text-sm font-medium text-black-normal">
            {groupData.description}
          </p>
          <Button variant="ghost" size="icon" onClick={onEditDescription}>
            <Pencil className="w-3.5 h-3.5 text-black-normal" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default GroupOverview;
