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
import { Loader2, UserMinus2 } from "lucide-react";
import { useToast as useToastMessage } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { getAssignedEmployeesForDealer, removeEmployeesFromDealer } from "@/service/dealerServices";

interface AssignedStaff {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

interface RemoveStaffPopupProps {
  open: boolean;
  onClose: () => void;
  dealerId: string | null;
  dealerName: string;
  currentStaff: string[]; // ids
  onSuccess: () => void;
}

export default function RemoveStaffPopup({
  open,
  onClose,
  dealerId,
  dealerName,
  onSuccess,
}: RemoveStaffPopupProps) {
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState<AssignedStaff[]>([]);
  const { showToast } = useToastMessage();

  useEffect(() => {
    async function fetchAssigned() {
      if (!dealerId) return;
      try {
        const res = await getAssignedEmployeesForDealer(dealerId);
        const raw: any = res?.data as any;
        const list: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.assignedEmployees)
            ? raw.assignedEmployees
            : Array.isArray(raw?.data)
              ? raw.data
              : [];

        const mapped: AssignedStaff[] = list.map((rec) => {
          // Prefer normalized fields from assignedEmployees API shape
          const idFromPayload = rec.employeeId || rec.employee_id || rec._id;
          const role = rec.role || (rec.user?.role) || (rec.assigned_user?.role);
          const nameFromPayload = rec.name || rec.employeeName || rec.user?.username || rec.user?.First_name || rec.assigned_user?.username || rec.assigned_user?.First_name;
          const emailFromPayload = rec.email || rec.user?.email || rec.assigned_user?.email;

          // Fallback to assigned_user style
          const assignedUser = rec.assigned_user || rec.user;
          const idFromAssigned = typeof assignedUser === "string" ? assignedUser : assignedUser?._id;
          const id = String(idFromPayload || idFromAssigned || "");
          const name = String(nameFromPayload || "");
          const email = emailFromPayload ? String(emailFromPayload) : undefined;
          return { _id: id, name, email, role };
        });
        setStaffList(mapped);
      } catch (err) {
        setStaffList([]);
        showToast("Failed to load assigned staff", "error");
      }
    }
    if (open) {
      setSelectedStaff([]);
      fetchAssigned();
    }
  }, [open, dealerId, showToast]);

  const handleToggle = (id: string) => {
    setSelectedStaff((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleRemove = async () => {
    if (!dealerId) {
      showToast("Missing dealer id", "error");
      return;
    }
    if (selectedStaff.length === 0) {
      showToast("Please select at least one staff member", "error");
      return;
    }
    try {
      setLoading(true);
      const response = await removeEmployeesFromDealer(dealerId, {
        employeeIds: selectedStaff,
        assignmentNotes: notes || undefined,
      });
      const message = (response && (response as any).message) || `Removed ${selectedStaff.length} staff member(s) from ${dealerName}`;
      showToast(message, "success");
      onSuccess();
      onClose();
      setSelectedStaff([]);
      setNotes("");
    } catch (err) {
      showToast("Failed to remove staff. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus2 className="w-5 h-5 text-[#C72920]" />
            Remove Staff from {dealerName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div>
            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
            />
          </div>

          {staffList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No staff currently assigned</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {staffList.map((s) => (
                <div key={s._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox id={s._id} checked={selectedStaff.includes(s._id)} onCheckedChange={() => handleToggle(s._id)} />
                  <div className="flex-1">
                    <label htmlFor={s._id} className="text-sm font-medium cursor-pointer">
                      {s.name}
                    </label>
                    {(s.email || s.role) && (
                      <p className="text-xs text-gray-500">{s.email}{s.email && s.role ? " • " : ""}{s.role}</p>
                    )}
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
          <Button onClick={handleRemove} disabled={loading || selectedStaff.length === 0} className="bg-[#C72920] hover:bg-[#A91E17]">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              `Remove ${selectedStaff.length} Staff`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

