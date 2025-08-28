"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from 'lucide-react';
import { useToast as useToastMessage } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { getAllEmployees } from "@/service/employeeServices";
import { assignEmployeesToDealer } from "@/service/dealerServices";
import type { Employee } from "@/types/employee-types";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignStaffPopupProps {
  open: boolean;
  onClose: () => void;
  dealerId: string | null;
  dealerName: string;
  currentStaff: string[];
  onSuccess: () => void;
}

export default function AssignStaffPopup({
  open,
  onClose,
  dealerId,
  dealerName,
  currentStaff = [],
  onSuccess
}: AssignStaffPopupProps) {
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const { showToast } = useToastMessage();

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await getAllEmployees();
        const employees = (res.data || []) as Employee[];
        const fulfillmentStaff = employees
          .filter((e) => (e.role || "").toLowerCase() === "fulfillment-staff")
          .map<Staff>((e) => {
            const name = e.First_name || ((e.user_id as any)?.username ?? "");
            return {
              _id: e._id,
              name,
              email: e.email,
              role: e.role,
            }
          });
        setStaffList(fulfillmentStaff);
      } catch (err) {
        setStaffList([]);
        showToast("Failed to load employees", "error");
      }
    }
    if (open) {
      setSelectedStaff([]);
      fetchEmployees();
    }
  }, [open, showToast]);

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleAssign = async () => {
    if (selectedStaff.length === 0) {
      showToast("Please select at least one staff member", "error");
      return;
    }

    try {
      setLoading(true);
      if (!dealerId) {
        showToast("Missing dealer id", "error");
        return;
      }
      const response = await assignEmployeesToDealer(dealerId, {
        employeeIds: selectedStaff,
        assignmentNotes: notes || undefined,
      });
      
      const message = (response && (response as any).message) || `Successfully assigned ${selectedStaff.length} staff member(s) to ${dealerName}`;
      showToast(message, "success");
      onSuccess();
      onClose();
      setSelectedStaff([]);
      setNotes("");
    } catch (error) {
      showToast("Failed to assign staff. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const availableStaff = staffList.filter(staff => !currentStaff.includes(staff._id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C72920]" />
            Assign Staff to {dealerName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div>
            <Textarea
              placeholder="Add assignment notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
            />
          </div>
          {availableStaff.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No available staff to assign
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableStaff.map((staff) => (
                <div key={staff._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={staff._id}
                    checked={selectedStaff.includes(staff._id)}
                    onCheckedChange={() => handleStaffToggle(staff._id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={staff._id} className="text-sm font-medium cursor-pointer">
                      {staff.name}
                    </label>
                    <p className="text-xs text-gray-500">{staff.email} • {staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={loading || selectedStaff.length === 0}
            className="bg-[#C72920] hover:bg-[#A91E17]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedStaff.length} Staff`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
