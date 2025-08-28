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
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  RefreshCw,
  Info,
  Banknote,
  Receipt,
  Shield,
  TrendingUp,
  TrendingDown,
  User,
  Building,
  Hash,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaymentDetailsById } from "@/service/payment-service";
import { PaymentDetail } from "@/types/paymentDetails-Types";

interface PaymentDetailsByIdProps {
  paymentId: string;
}

export default function PaymentDetailsById({ paymentId }: PaymentDetailsByIdProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentDetailsById(paymentId);
      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        setError("Failed to load payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setError("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    
    switch (status.toLowerCase()) {
      case "paid":
        return `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case "created":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "failed":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case "refunded":
        return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;
      case "pending":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "created":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "refunded":
        return <Receipt className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "upi":
        return <Banknote className="h-4 w-4" />;
      case "netbanking":
        return <Building className="h-4 w-4" />;
      case "wallet":
        return <Shield className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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

  if (error || !payment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Payment not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

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
            Back to Payments
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600">Payment ID: {payment._id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPaymentDetails}
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
              <DropdownMenuItem onClick={() => copyToClipboard(payment._id)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Payment ID
              </DropdownMenuItem>
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
              {getStatusIcon(payment.payment_status)}
              <div>
                <h3 className="font-semibold text-gray-900">Payment Status</h3>
                <Badge className={getStatusBadge(payment.payment_status)}>
                  {payment.payment_status}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transaction">Transaction</TabsTrigger>
              <TabsTrigger value="refund">Refund</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {payment.payment_method}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(payment.created_at)}
                      </p>
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-900">
                          {payment.order_id || "N/A"}
                        </p>
                        {payment.order_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.order_id!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Razorpay Order ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-900">
                          {payment.razorpay_order_id}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.razorpay_order_id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transaction" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>Detailed transaction information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-900">
                          {payment.payment_id || "N/A"}
                        </p>
                        {payment.payment_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.payment_id!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Acquirer Data */}
                  {payment.acquirer_data && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Acquirer Data</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {payment.acquirer_data.bank_transaction_id && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Bank Transaction ID</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data.bank_transaction_id}
                            </p>
                          </div>
                        )}
                        {payment.acquirer_data.rrn && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">RRN</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data.rrn}
                            </p>
                          </div>
                        )}
                        {payment.acquirer_data.upi_transaction_id && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">UPI Transaction ID</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data.upi_transaction_id}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="refund" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Refund Information</CardTitle>
                  <CardDescription>Refund status and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Refund Status</label>
                      <div className="mt-1">
                        <Badge className={payment.is_refund 
                          ? "px-3 py-1 rounded-full text-xs font-medium border text-purple-600 bg-purple-50 border-purple-200"
                          : "px-3 py-1 rounded-full text-xs font-medium border text-gray-600 bg-gray-50 border-gray-200"
                        }>
                          {payment.is_refund ? "Refunded" : "Not Refunded"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Refund Success</label>
                      <div className="mt-1">
                        <Badge className={payment.refund_successful 
                          ? "px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-50 border-green-200"
                          : "px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200"
                        }>
                          {payment.refund_successful ? "Successful" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!payment.is_refund && (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No refund has been processed for this payment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Since Payment</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor((Date.now() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Payment Method</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {payment.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Refund Status</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment.is_refund ? "Refunded" : "Not Refunded"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Amount</p>
                    <p className="text-xs text-gray-500">Total payment</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getPaymentMethodIcon(payment.payment_method)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Method</p>
                    <p className="text-xs text-gray-500">Payment method</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {payment.payment_method}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-xs text-gray-500">Payment date</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
