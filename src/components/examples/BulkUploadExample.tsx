"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BulkUploadProgress from "@/components/ui/bulk-upload-progress";
import { useBulkUpload } from "@/hooks/useBulkUpload";
import { Upload, Package, Users, Building, FileText } from "lucide-react";

export default function BulkUploadExample() {
  const [uploadType, setUploadType] = useState<string>("products");
  const [itemList, setItemList] = useState<string>("");
  const [bulkState, bulkActions] = useBulkUpload();

  const handleStartUpload = async () => {
    const items = itemList.split('\n').filter(item => item.trim() !== '');
    
    if (items.length === 0) {
      alert("Please enter at least one item");
      return;
    }

    // Start the upload process
    bulkActions.startUpload(
      items,
      `Bulk ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Upload`,
      `Uploading ${items.length} ${uploadType}...`,
      uploadType as any
    );

    // Simulate processing each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = `item-${i}`;
      
      // Update to processing
      bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        bulkActions.updateItemStatus(itemId, "processing", undefined, progress);
      }
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.2; // 80% success rate
      if (isSuccess) {
        bulkActions.updateItemStatus(itemId, "completed");
      } else {
        bulkActions.updateItemStatus(itemId, "failed", "Validation failed: Invalid data format");
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Complete the upload
    bulkActions.completeUpload();
  };

  const getUploadTypeConfig = (type: string) => {
    switch (type) {
      case "products":
        return {
          icon: <Package className="h-5 w-5" />,
          placeholder: "Enter product names (one per line)\nExample:\nBrake Pads\nOil Filter\nAir Filter",
          description: "Upload multiple products at once"
        };
      case "categories":
        return {
          icon: <FileText className="h-5 w-5" />,
          placeholder: "Enter category names (one per line)\nExample:\nBrake System\nEngine Parts\nElectrical",
          description: "Upload multiple categories at once"
        };
      case "dealers":
        return {
          icon: <Building className="h-5 w-5" />,
          placeholder: "Enter dealer names (one per line)\nExample:\nAuto Parts Plus\nCar Care Center\nQuick Fix Garage",
          description: "Upload multiple dealers at once"
        };
      case "users":
        return {
          icon: <Users className="h-5 w-5" />,
          placeholder: "Enter user emails (one per line)\nExample:\nuser1@example.com\nuser2@example.com",
          description: "Upload multiple users at once"
        };
      default:
        return {
          icon: <Upload className="h-5 w-5" />,
          placeholder: "Enter items (one per line)",
          description: "Upload multiple items at once"
        };
    }
  };

  const config = getUploadTypeConfig(uploadType);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Example</h1>
        <p className="text-gray-600 mt-1">
          Demonstrate bulk upload functionality with progress tracking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {config.icon}
            <span className="ml-2">Bulk Upload Configuration</span>
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="upload-type">Upload Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select upload type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                  <SelectItem value="dealers">Dealers</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="assignments">Assignments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-count">Item Count</Label>
              <Input
                id="item-count"
                value={itemList.split('\n').filter(item => item.trim() !== '').length}
                readOnly
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="item-list">Items to Upload</Label>
            <textarea
              id="item-list"
              className="w-full h-32 p-3 border rounded-md resize-none"
              placeholder={config.placeholder}
              value={itemList}
              onChange={(e) => setItemList(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={handleStartUpload} disabled={!itemList.trim()}>
              <Upload className="h-4 w-4 mr-2" />
              Start Bulk Upload
            </Button>
            <Button
              variant="outline"
              onClick={() => setItemList("")}
              disabled={!itemList.trim()}
            >
              Clear List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload Progress Dialog */}
      <BulkUploadProgress
        isOpen={bulkState.isOpen}
        onClose={bulkActions.closeUpload}
        title={bulkState.title}
        description={bulkState.description}
        actionType={bulkState.actionType}
        items={bulkState.items}
        totalItems={bulkState.totalItems}
        completedItems={bulkState.completedItems}
        failedItems={bulkState.failedItems}
        skippedItems={bulkState.skippedItems}
        isProcessing={bulkState.isProcessing}
        onRetry={bulkActions.retryFailed}
        onDownloadResults={bulkActions.downloadResults}
        onViewDetails={bulkActions.viewDetails}
      />
    </div>
  );
}
