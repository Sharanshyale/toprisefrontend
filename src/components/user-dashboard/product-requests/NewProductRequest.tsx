"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  X,
  FileText,
  Package,
  TrendingUp,
  Tag,
  Edit,
  AlertTriangle,
  Clock,
  CheckSquare,
  Zap,
} from "lucide-react";
import { createProductRequest } from "@/service/product-request-service";
import { CreateProductRequestRequest } from "@/types/product-request-Types";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function NewProductRequest() {
  const router = useRouter();
  const { showToast } = useGlobalToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductRequestRequest>({
    productName: "",
    skuCode: "",
    requestType: "new_product",
    priority: "medium",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    estimatedCost: 0,
    impactLevel: "medium",
    affectedSystems: [],
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [newSystem, setNewSystem] = useState("");

  const handleInputChange = (field: keyof CreateProductRequestRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange("tags", [...(formData.tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange("tags", formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleAddSystem = () => {
    if (newSystem.trim() && !formData.affectedSystems?.includes(newSystem.trim())) {
      handleInputChange("affectedSystems", [...(formData.affectedSystems || []), newSystem.trim()]);
      setNewSystem("");
    }
  };

  const handleRemoveSystem = (systemToRemove: string) => {
    handleInputChange("affectedSystems", formData.affectedSystems?.filter(system => system !== systemToRemove) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.description.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await createProductRequest(formData);
      if (response.success) {
        showToast("Request created successfully", "success");
        router.push("/user/dashboard/requests");
      } else {
        showToast("Failed to create request", "error");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      showToast("Failed to create request", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "new_product":
        return <Plus className="w-4 h-4" />;
      case "update_product":
        return <Edit className="w-4 h-4" />;
      case "price_change":
        return <TrendingUp className="w-4 h-4" />;
      case "stock_update":
        return <Package className="w-4 h-4" />;
      case "category_change":
        return <Tag className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckSquare className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Product Request</h1>
            <p className="text-gray-600 mt-1">
              Create a new product-related request
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the basic details about your request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuCode">SKU Code</Label>
                <Input
                  id="skuCode"
                  value={formData.skuCode}
                  onChange={(e) => handleInputChange("skuCode", e.target.value)}
                  placeholder="Enter SKU code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type *</Label>
                <Select
                  value={formData.requestType}
                  onValueChange={(value) => handleInputChange("requestType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_product">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon("new_product")}
                        <span>New Product</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="update_product">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon("update_product")}
                        <span>Update Product</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="price_change">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon("price_change")}
                        <span>Price Change</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stock_update">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon("stock_update")}
                        <span>Stock Update</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="category_change">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon("category_change")}
                        <span>Category Change</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your request in detail..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Additional product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Enter category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange("subcategory", e.target.value)}
                  placeholder="Enter subcategory"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Enter brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange("estimatedCost", parseFloat(e.target.value) || 0)}
                  placeholder="Enter estimated cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impactLevel">Impact Level</Label>
                <Select
                  value={formData.impactLevel}
                  onValueChange={(value) => handleInputChange("impactLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Add relevant tags to help categorize your request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affected Systems */}
        <Card>
          <CardHeader>
            <CardTitle>Affected Systems</CardTitle>
            <CardDescription>
              Specify which systems will be affected by this request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSystem}
                onChange={(e) => setNewSystem(e.target.value)}
                placeholder="Enter affected system"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSystem())}
              />
              <Button type="button" onClick={handleAddSystem} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.affectedSystems && formData.affectedSystems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.affectedSystems.map((system, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {system}
                    <button
                      type="button"
                      onClick={() => handleRemoveSystem(system)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Request Summary</CardTitle>
            <CardDescription>
              Review your request before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                <p className="text-sm font-medium">{formData.productName || "Not specified"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Request Type</Label>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(formData.requestType)}
                  <span className="text-sm font-medium capitalize">
                    {formData.requestType.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Priority</Label>
                <div className="mt-1">
                  {getPriorityBadge(formData.priority)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Impact Level</Label>
                <p className="text-sm font-medium capitalize">{formData.impactLevel}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-sm mt-1">{formData.description || "No description provided"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
