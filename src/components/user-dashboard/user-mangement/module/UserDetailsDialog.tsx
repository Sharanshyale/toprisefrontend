"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Viewuser from "./viewuser";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export default function UserDetailsDialog({ open, onOpenChange, userId }: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {userId ? (
          <Viewuser id={userId} />
        ) : (
          <div className="text-sm text-gray-500">No user selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


