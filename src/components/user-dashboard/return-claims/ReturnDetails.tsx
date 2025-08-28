"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Eye, 
  CheckCircle, 
  Edit, 
  Truck, 
  Package, 
  DollarSign,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  FileText,
  Image,
  Download,
  Share2,
  MoreHorizontal,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getReturnRequestsById } from "@/service/return-service";
import { ReturnRequest } from "@/types/return-Types";
import ValidateReturnRequest from "./modules/modalpopus/Validate";
import SchedulePickupDialog from "./modules/modalpopus/SchedulePickupDialog";
import CompletePickupDialog from "./modules/modalpopus/CompletePickupDialog";
import InspectDialog from "./modules/modalpopus/inspectDialog";
import InitiateRefundForm from "./modules/modalpopus/InitiateReturn";

interface ReturnDetailsProps {
  returnId: string;
}

export default function ReturnDetails({ returnId }: ReturnDetailsProps) {
  const router = useRouter();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [validationDialog, setValidationDialog] = useState(false);
  const [schedulePickupDialog, setSchedulePickupDialog] = useState(false);
  const [completePickupDialog, setCompletePickupDialog] = useState(false);
  const [inspectDialog, setInspectDialog] = useState(false);
  const [initiateRefundDialog, setInitiateRefundDialog] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReturnRequestsById(returnId);
      if (response.success && response.data) {
        // The API returns the return data directly in response.data
        setReturnRequest(response.data);
      } else {
        setError("Failed to load return details");
      }
    } catch (error) {
      console.error("Error fetching return details:", error);
      setError("Failed to load return details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    
    switch (status) {
      case "Requested":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      case "Validated":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "Approved":
        return `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case "Rejected":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case "Pickup_Scheduled":
        return `${baseClasses} text-indigo-600 bg-indigo-50 border-indigo-200`;
      case "Pickup_Completed":
        return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;
      case "Under_Inspection":
        return `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;
      case "Refund_Processed":
        return `${baseClasses} text-pink-600 bg-pink-50 border-pink-200`;
      case "Completed":
        return `${baseClasses} text-emerald-600 bg-emerald-50 border-emerald-200`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Requested":
        return <Clock className="h-4 w-4" />;
      case "Validated":
        return <CheckCircle className="h-4 w-4" />;
      case "Approved":
        return <Check className="h-4 w-4" />;
      case "Rejected":
        return <X className="h-4 w-4" />;
      case "Pickup_Scheduled":
        return <Truck className="h-4 w-4" />;
      case "Pickup_Completed":
        return <Package className="h-4 w-4" />;
      case "Under_Inspection":
        return <Eye className="h-4 w-4" />;
      case "Refund_Processed":
        return <DollarSign className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getAvailableActions = () => {
    if (!returnRequest) return [];
    
    const actions = [];
    
    switch (returnRequest.returnStatus) {
      case "Requested":
        actions.push({
          label: "Validate Return",
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => setValidationDialog(true),
          variant: "default" as const,
        });
        break;
      case "Validated":
        actions.push({
          label: "Schedule Pickup",
          icon: <Truck className="h-4 w-4" />,
          onClick: () => setSchedulePickupDialog(true),
          variant: "default" as const,
        });
        break;
      case "Pickup_Scheduled":
        actions.push({
          label: "Complete Pickup",
          icon: <Package className="h-4 w-4" />,
          onClick: () => setCompletePickupDialog(true),
          variant: "default" as const,
        });
        break;
      case "Pickup_Completed":
      case "Under_Inspection":
        actions.push({
          label: "Inspect Item",
          icon: <Eye className="h-4 w-4" />,
          onClick: () => setInspectDialog(true),
          variant: "default" as const,
        });
        break;
      case "Approved":
        actions.push({
          label: "Initiate Refund",
          icon: <DollarSign className="h-4 w-4" />,
          onClick: () => setInitiateRefundDialog(true),
          variant: "default" as const,
        });
        break;
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !returnRequest) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Return not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Return Details</h1>
            <p className="text-gray-600">Return ID: {returnRequest._id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReturnDetails}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(returnRequest.returnStatus)}
              <div>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <Badge className={getStatusBadge(returnRequest.returnStatus)}>
                  {returnRequest.returnStatus}
                </Badge>
              </div>
            </div>
            
            {availableActions.length > 0 && (
              <div className="flex gap-2">
                {availableActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="sm"
                    onClick={action.onClick}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">SKU</label>
                      <p className="text-sm font-mono text-gray-900">{returnRequest.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantity</label>
                      <p className="text-sm text-gray-900">{returnRequest.quantity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Return Reason</label>
                      <p className="text-sm text-gray-900">{returnRequest.returnReason}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Request Date</label>
                      <p className="text-sm text-gray-900">{formatDate(returnRequest.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <p className="text-sm font-mono text-gray-900">
                        {returnRequest.orderId?.orderId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order Date</label>
                      <p className="text-sm text-gray-900">
                        {returnRequest.orderId?.orderDate 
                          ? formatDate(returnRequest.orderId.orderDate)
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Refund Information */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <DollarSign className="h-5 w-5" />
                     Refund Information
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-medium text-gray-500">Refund Amount</label>
                       <p className="text-lg font-semibold text-green-600">
                         {formatCurrency(returnRequest.refund.refundAmount)}
                       </p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-500">Refund Method</label>
                       <p className="text-sm text-gray-900">
                         {returnRequest.refund.refundMethod || "Not specified"}
                       </p>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-gray-500">Refund Status</label>
                       <Badge className={getStatusBadge(returnRequest.refund.refundStatus)}>
                         {returnRequest.refund.refundStatus}
                       </Badge>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Inspection Information */}
               {returnRequest.inspection && (
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Eye className="h-5 w-5" />
                       Inspection Information
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-sm font-medium text-gray-500">Inspection Status</label>
                         <Badge className={returnRequest.inspection.isApproved 
                           ? "px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200"
                           : "px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200"
                         }>
                           {returnRequest.inspection.isApproved ? "Approved" : "Rejected"}
                         </Badge>
                       </div>
                       <div>
                         <label className="text-sm font-medium text-gray-500">SKU Match</label>
                         <Badge className={returnRequest.inspection.skuMatch 
                           ? "px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200"
                           : "px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200"
                         }>
                           {returnRequest.inspection.skuMatch ? "Matched" : "Not Matched"}
                         </Badge>
                       </div>
                       <div>
                         <label className="text-sm font-medium text-gray-500">Condition</label>
                         <p className="text-sm text-gray-900">{returnRequest.inspection.condition || "N/A"}</p>
                       </div>
                       <div>
                         <label className="text-sm font-medium text-gray-500">Inspected At</label>
                         <p className="text-sm text-gray-900">
                           {returnRequest.inspection.inspectedAt 
                             ? formatDate(returnRequest.inspection.inspectedAt)
                             : "N/A"
                           }
                         </p>
                       </div>
                     </div>
                     {returnRequest.inspection.conditionNotes && (
                       <div>
                         <label className="text-sm font-medium text-gray-500">Condition Notes</label>
                         <p className="text-sm text-gray-900 mt-1">{returnRequest.inspection.conditionNotes}</p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               )}
            </TabsContent>

                         <TabsContent value="timeline" className="space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Return Timeline</CardTitle>
                   <CardDescription>Track the progress of this return request</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {/* Return Requested */}
                     <div className="flex items-start gap-4">
                       <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                       <div className="flex-1">
                         <p className="font-medium">Return Requested</p>
                         <p className="text-sm text-gray-500">
                           {returnRequest.timestamps?.requestedAt 
                             ? formatDate(returnRequest.timestamps.requestedAt)
                             : formatDate(returnRequest.createdAt)
                           }
                         </p>
                         <p className="text-sm text-gray-600 mt-1">Customer submitted return request</p>
                       </div>
                     </div>
                     
                     {/* Return Validated */}
                     {returnRequest.timestamps?.validatedAt && (
                       <div className="flex items-start gap-4">
                         <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <p className="font-medium">Return Validated</p>
                           <p className="text-sm text-gray-500">{formatDate(returnRequest.timestamps.validatedAt)}</p>
                           <p className="text-sm text-gray-600 mt-1">Return request was validated by admin</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Pickup Scheduled */}
                     {returnRequest.timestamps?.pickupScheduledAt && (
                       <div className="flex items-start gap-4">
                         <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <p className="font-medium">Pickup Scheduled</p>
                           <p className="text-sm text-gray-500">{formatDate(returnRequest.timestamps.pickupScheduledAt)}</p>
                           <p className="text-sm text-gray-600 mt-1">Pickup was scheduled for the return</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Pickup Completed */}
                     {returnRequest.timestamps?.pickupCompletedAt && (
                       <div className="flex items-start gap-4">
                         <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <p className="font-medium">Pickup Completed</p>
                           <p className="text-sm text-gray-500">{formatDate(returnRequest.timestamps.pickupCompletedAt)}</p>
                           <p className="text-sm text-gray-600 mt-1">Item was successfully picked up</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Inspection Started */}
                     {returnRequest.timestamps?.inspectionStartedAt && (
                       <div className="flex items-start gap-4">
                         <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <p className="font-medium">Inspection Started</p>
                           <p className="text-sm text-gray-500">{formatDate(returnRequest.timestamps.inspectionStartedAt)}</p>
                           <p className="text-sm text-gray-600 mt-1">Item inspection began</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Inspection Completed */}
                     {returnRequest.timestamps?.inspectionCompletedAt && (
                       <div className="flex items-start gap-4">
                         <div className="w-3 h-3 bg-pink-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <p className="font-medium">Inspection Completed</p>
                           <p className="text-sm text-gray-500">{formatDate(returnRequest.timestamps.inspectionCompletedAt)}</p>
                           <p className="text-sm text-gray-600 mt-1">
                             Item inspection completed - {returnRequest.inspection?.isApproved ? 'Approved' : 'Rejected'}
                           </p>
                         </div>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>

                         <TabsContent value="documents" className="space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Documents & Attachments</CardTitle>
                   <CardDescription>Related documents and images</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {returnRequest.returnImages && returnRequest.returnImages.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {returnRequest.returnImages.map((imageUrl, index) => (
                         <div key={index} className="relative group">
                           <img
                             src={imageUrl}
                             alt={`Return image ${index + 1}`}
                             className="w-full h-48 object-cover rounded-lg border border-gray-200"
                             onError={(e) => {
                               e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                             }}
                           />
                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                             <Button
                               variant="secondary"
                               size="sm"
                               className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                               onClick={() => window.open(imageUrl, '_blank')}
                             >
                               <Eye className="h-4 w-4 mr-2" />
                               View Full
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                       <p>No documents attached</p>
                     </div>
                   )}
                   
                   {returnRequest.inspection?.inspectionImages && returnRequest.inspection.inspectionImages.length > 0 && (
                     <div className="mt-8">
                       <h4 className="font-medium text-gray-900 mb-4">Inspection Images</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {returnRequest.inspection.inspectionImages.map((imageUrl, index) => (
                           <div key={index} className="relative group">
                             <img
                               src={imageUrl}
                               alt={`Inspection image ${index + 1}`}
                               className="w-full h-48 object-cover rounded-lg border border-gray-200"
                               onError={(e) => {
                                 e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";
                               }}
                             />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                               <Button
                                 variant="secondary"
                                 size="sm"
                                 className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                 onClick={() => window.open(imageUrl, '_blank')}
                               >
                                 <Eye className="h-4 w-4 mr-2" />
                                 View Full
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                  <CardDescription>Actions you can perform on this return</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableActions.length > 0 ? (
                    <div className="space-y-3">
                      {availableActions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant}
                          onClick={action.onClick}
                          className="w-full justify-start"
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No actions available for current status</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {returnRequest.orderId?.customerDetails?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {returnRequest.orderId?.customerDetails?.email || "N/A"}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.phone || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">
                    {returnRequest.orderId?.customerDetails?.address || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Information */}
          {returnRequest.pickupRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Pickup Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                                     <div>
                     <label className="text-sm font-medium text-gray-500">Pickup Address</label>
                     <p className="text-sm text-gray-900">
                       {returnRequest.pickupRequest.pickupAddress 
                         ? `${returnRequest.pickupRequest.pickupAddress.address}, ${returnRequest.pickupRequest.pickupAddress.city}, ${returnRequest.pickupRequest.pickupAddress.state} - ${returnRequest.pickupRequest.pickupAddress.pincode}`
                         : "N/A"
                       }
                     </p>
                   </div>
                                     <div>
                     <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                     <p className="text-sm text-gray-900">
                       {returnRequest.pickupRequest.scheduledDate 
                         ? formatDate(returnRequest.pickupRequest.scheduledDate)
                         : "N/A"
                       }
                     </p>
                   </div>
                   <div>
                     <label className="text-sm font-medium text-gray-500">Logistics Partner</label>
                     <p className="text-sm text-gray-900">
                       {returnRequest.pickupRequest.logisticsPartner || "N/A"}
                     </p>
                   </div>
                   {returnRequest.pickupRequest.trackingNumber && (
                     <div>
                       <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                       <p className="text-sm font-mono text-gray-900">
                         {returnRequest.pickupRequest.trackingNumber}
                       </p>
                     </div>
                   )}
                   {returnRequest.pickupRequest.completedDate && (
                     <div>
                       <label className="text-sm font-medium text-gray-500">Completed Date</label>
                       <p className="text-sm text-gray-900">
                         {formatDate(returnRequest.pickupRequest.completedDate)}
                       </p>
                     </div>
                   )}
                                     <div>
                     <label className="text-sm font-medium text-gray-500">Pickup Status</label>
                     <Badge className={getStatusBadge(returnRequest.returnStatus)}>
                       {returnRequest.returnStatus}
                     </Badge>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Since Request</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor((Date.now() - new Date(returnRequest.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(returnRequest.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ValidateReturnRequest
        open={validationDialog}
        onClose={() => setValidationDialog(false)}
        onValidationComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setValidationDialog(false);
        }}
        returnId={returnId}
      />
      
      <SchedulePickupDialog
        open={schedulePickupDialog}
        onClose={() => setSchedulePickupDialog(false)}
        onScheduleComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setSchedulePickupDialog(false);
        }}
        returnId={returnId}
                 initialPickupAddress={returnRequest.pickupRequest?.pickupAddress || undefined}
      />
      
      <CompletePickupDialog
        open={completePickupDialog}
        onClose={() => setCompletePickupDialog(false)}
        onComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setCompletePickupDialog(false);
        }}
        returnId={returnId}
        returnRequest={returnRequest}
      />
      
      <InspectDialog
        open={inspectDialog}
        onClose={() => setInspectDialog(false)}
        onInspectComplete={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setInspectDialog(false);
        }}
        returnId={returnId}
        returnStatus={returnRequest.returnStatus}
      />
      
      <InitiateRefundForm
        open={initiateRefundDialog}
        onClose={() => setInitiateRefundDialog(false)}
        returnId={returnId}
        onSubmit={(success) => {
          if (success) {
            fetchReturnDetails();
          }
          setInitiateRefundDialog(false);
        }}
      />
    </div>
  );
}
