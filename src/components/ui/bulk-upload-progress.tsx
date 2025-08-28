"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Package,
  Building,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";

export interface BulkUploadItem {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed" | "skipped";
  error?: string;
  progress?: number;
}

export interface BulkUploadProgressProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionType: "products" | "categories" | "dealers" | "assignments" | "users" | "custom";
  items: BulkUploadItem[];
  totalItems: number;
  completedItems: number;
  failedItems: number;
  skippedItems: number;
  isProcessing: boolean;
  onRetry?: () => void;
  onDownloadResults?: () => void;
  onViewDetails?: () => void;
  customIcon?: React.ReactNode;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "products":
      return <Package className="h-5 w-5" />;
    case "categories":
      return <FileText className="h-5 w-5" />;
    case "dealers":
      return <Building className="h-5 w-5" />;
    case "assignments":
      return <Users className="h-5 w-5" />;
    case "users":
      return <Users className="h-5 w-5" />;
    default:
      return <Upload className="h-5 w-5" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "processing":
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    case "pending":
      return <Clock className="h-4 w-4 text-gray-400" />;
    case "skipped":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>;
    case "skipped":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Skipped</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default function BulkUploadProgress({
  isOpen,
  onClose,
  title,
  description,
  actionType,
  items,
  totalItems,
  completedItems,
  failedItems,
  skippedItems,
  isProcessing,
  onRetry,
  onDownloadResults,
  onViewDetails,
  customIcon,
}: BulkUploadProgressProps) {
  const [progress, setProgress] = useState(0);

  // Calculate progress percentage
  useEffect(() => {
    if (totalItems > 0) {
      const progressPercentage = ((completedItems + failedItems + skippedItems) / totalItems) * 100;
      setProgress(Math.min(progressPercentage, 100));
    }
  }, [completedItems, failedItems, skippedItems, totalItems]);

  const isCompleted = !isProcessing && (completedItems + failedItems + skippedItems) >= totalItems;
  const hasErrors = failedItems > 0;
  const hasSkipped = skippedItems > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {customIcon || getActionIcon(actionType)}
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            {/* Main Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{failedItems}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{skippedItems}</div>
                <div className="text-sm text-yellow-600">Skipped</div>
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-600">Processing items...</span>
              </div>
            )}

            {/* Completion Status */}
            {isCompleted && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                hasErrors ? 'bg-red-50' : 'bg-green-50'
              }`}>
                {hasErrors ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Upload completed with {failedItems} error{failedItems !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Upload completed successfully!
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Item Details</h4>
              <span className="text-sm text-gray-500">
                {items.length} of {totalItems} items
              </span>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      {item.error && (
                        <div className="text-sm text-red-600 truncate">{item.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.progress !== undefined && item.status === "processing" && (
                      <div className="w-16">
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {onRetry && hasErrors && (
                <Button variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
              )}
              {onViewDetails && (
                <Button variant="outline" onClick={onViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onDownloadResults && isCompleted && (
                <Button variant="outline" onClick={onDownloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
              )}
              <Button onClick={onClose}>
                {isCompleted ? "Close" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
