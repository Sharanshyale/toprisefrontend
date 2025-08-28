import { useState, useCallback } from "react";
import { BulkUploadItem } from "@/components/ui/bulk-upload-progress";

export interface BulkUploadState {
  isOpen: boolean;
  isProcessing: boolean;
  items: BulkUploadItem[];
  totalItems: number;
  completedItems: number;
  failedItems: number;
  skippedItems: number;
  title: string;
  description: string;
  actionType: "products" | "categories" | "dealers" | "assignments" | "users" | "custom";
}

export interface BulkUploadActions {
  startUpload: (items: string[], title: string, description: string, actionType: BulkUploadState["actionType"]) => void;
  updateItemStatus: (id: string, status: BulkUploadItem["status"], error?: string, progress?: number) => void;
  completeUpload: () => void;
  closeUpload: () => void;
  retryFailed: () => void;
  downloadResults: () => void;
  viewDetails: () => void;
}

export function useBulkUpload(): [BulkUploadState, BulkUploadActions] {
  const [state, setState] = useState<BulkUploadState>({
    isOpen: false,
    isProcessing: false,
    items: [],
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    skippedItems: 0,
    title: "",
    description: "",
    actionType: "custom",
  });

  const startUpload = useCallback((
    items: string[],
    title: string,
    description: string,
    actionType: BulkUploadState["actionType"]
  ) => {
    const bulkItems: BulkUploadItem[] = items.map((item, index) => ({
      id: `item-${index}`,
      name: item,
      status: "pending" as const,
    }));

    setState({
      isOpen: true,
      isProcessing: true,
      items: bulkItems,
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      skippedItems: 0,
      title,
      description,
      actionType,
    });
  }, []);

  const updateItemStatus = useCallback((
    id: string,
    status: BulkUploadItem["status"],
    error?: string,
    progress?: number
  ) => {
    setState(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === id
          ? { ...item, status, error, progress }
          : item
      );

      const completedItems = updatedItems.filter(item => item.status === "completed").length;
      const failedItems = updatedItems.filter(item => item.status === "failed").length;
      const skippedItems = updatedItems.filter(item => item.status === "skipped").length;

      return {
        ...prev,
        items: updatedItems,
        completedItems,
        failedItems,
        skippedItems,
      };
    });
  }, []);

  const completeUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
    }));
  }, []);

  const closeUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const retryFailed = useCallback(() => {
    setState(prev => {
      const updatedItems = prev.items.map(item =>
        item.status === "failed"
          ? { ...item, status: "pending" as const, error: undefined, progress: undefined }
          : item
      );

      return {
        ...prev,
        items: updatedItems,
        isProcessing: true,
        failedItems: 0,
      };
    });
  }, []);

  const downloadResults = useCallback(() => {
    // Implementation for downloading results
    console.log("Downloading results...");
  }, []);

  const viewDetails = useCallback(() => {
    // Implementation for viewing details
    console.log("Viewing details...");
  }, []);

  return [
    state,
    {
      startUpload,
      updateItemStatus,
      completeUpload,
      closeUpload,
      retryFailed,
      downloadResults,
      viewDetails,
    },
  ];
}
