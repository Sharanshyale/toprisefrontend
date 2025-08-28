"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaymentDetailsById } from "@/service/payment-service";
import { PaymentDetail } from "@/types/paymentDetails-Types";
import { X, Calendar, CreditCard, RefreshCw, CheckCircle } from "lucide-react";

interface PaymentDetailByIdProps {
    open: boolean;
    onClose: () => void
   
    paymentId: string | null;
   
  }

export default function PaymentDetailById({ open, onClose, paymentId }: PaymentDetailByIdProps) {
    const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!paymentId || !open) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await getPaymentDetailsById(paymentId);
                if (response.data) {
                    // Response structure: { success: true, message: "...", data: PaymentDetail }
                    setPaymentDetail(response.data);
                } else {
                    setError("Payment details not found");
                }
            } catch (err: any) {
                console.log("error in payment detail by id", err);
                setError("Failed to fetch payment details");
            } finally {
                setLoading(false);
            }
        };
        
        fetchPaymentDetails();
    }, [paymentId, open]);

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
        switch (status.toLowerCase()) {
            case "paid":
                return `${baseClasses} text-green-700 bg-green-100`;
            case "created":
            case "pending":
                return `${baseClasses} text-yellow-700 bg-yellow-100`;
            case "failed":
                return `${baseClasses} text-red-700 bg-red-100`;
            case "refunded":
                return `${baseClasses} text-blue-700 bg-blue-100`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Payment Details
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        
                    </button>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <DynamicButton
                            variant="outline"
                            text="Close"
                            onClick={onClose}
                        />
                    </div>
                ) : paymentDetail ? (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {paymentDetail.payment_id || 'N/A'}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Razorpay Order: {paymentDetail.razorpay_order_id}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatAmount(paymentDetail.amount)}
                                    </div>
                                    <Badge className={getStatusBadge(paymentDetail.payment_status)}>
                                        {paymentDetail.payment_status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-sm font-medium text-gray-900">
                                            Payment Method
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold capitalize">
                                            {paymentDetail.payment_method}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                        <CardTitle className="text-sm font-medium text-gray-900">
                                            Transaction Date
                                        </CardTitle>
                                    </div>
                                    <p className="text-lg font-semibold">
                                        {formatDate(paymentDetail.created_at)}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <RefreshCw className="h-5 w-5 text-orange-600" />
                                        <CardTitle className="text-sm font-medium text-gray-900">
                                            Refund Status
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {paymentDetail.is_refund ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="text-lg font-semibold text-green-600">
                                                    Refunded
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-semibold text-gray-600">
                                                No Refund
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <CardTitle className="text-sm font-medium text-gray-900 mb-3">
                                        Order Information
                                    </CardTitle>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Order ID:</span>
                                            <p className="font-medium">
                                                {paymentDetail.order_id || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Payment ID:</span>
                                            <p className="font-medium font-mono text-sm">
                                                {paymentDetail.payment_id || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <DynamicButton
                                variant="outline"
                                text="Close"
                                onClick={onClose}
                                className="flex-1"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Found</h3>
                        <p className="text-gray-500 mb-4">The requested payment details could not be found.</p>
                        <DynamicButton
                            variant="outline"
                            text="Close"
                            onClick={onClose}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}