import React, { useState } from 'react'
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { statusUpdate } from "@/service/Ticket-service";
import { toast } from "@/hooks/use-toast";

interface UpdateStatusProps {
    open: boolean;
    onClose: () => void;
    ticketId: string | null;
    onStatusUpdated?: () => void;
}

export default function UpdateStatus({open, onClose, ticketId, onStatusUpdated}: UpdateStatusProps) {
    const [status, setStatus] = useState<string>("");
    const [adminNotes, setAdminNotes] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // You'll need to get this from your auth context or store
    const updatedBy = "685bf85bee1e2d9c9bd7f1b1"; // This should come from logged in user

    const handleSubmit = async () => {
        if (!ticketId || !status) {
            toast({
                title: "Error",
                description: "Please select a status",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await statusUpdate(ticketId, {
                status,
                admin_notes: adminNotes,
                updated_by: updatedBy
            });

            toast({
                title: "Success",
                description: "Ticket status updated successfully",
            });

            // Reset form
            setStatus("");
            setAdminNotes("");
            
            // Call callback to refresh data
            if (onStatusUpdated) {
                onStatusUpdated();
            }
            
            onClose();
        } catch (err: any) {
            console.log("error in status update", err);
            toast({
                title: "Error",
                description: "Failed to update ticket status",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStatus("");
        setAdminNotes("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogOverlay>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Ticket Status</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adminNotes">Admin Notes</Label>
                            <Textarea
                                id="adminNotes"
                                placeholder="Enter admin notes..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <DynamicButton
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </DynamicButton>
                        <DynamicButton
                            onClick={handleSubmit}
                            disabled={loading || !status}
                            loading={loading}
                        >
                            Update Status
                        </DynamicButton>
                    </div>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    );
}