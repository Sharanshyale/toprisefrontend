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
import { getTokenPayload } from "@/utils/cookies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import {  getProducts } from "@/service/product-Service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const products = [
  {
    id: 1,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    sku: "TOP-BRK-000453",
    currentSellingPrice: "₹1,099.00",
    BaseCost: "₹899.00",
    Margin: "10.0%",
    status: "Active",
    createdDate: "2023-01-15",
    updatedDate: "2024-03-20",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=40&width=40",
    name: "Rear Brake Shoe - Alto 800 2018 Petrol",
    sku: "TOP-BRK-000454",
    currentSellingPrice: "₹850.00",
    BaseCost: "₹650.00",
    Margin: "15.0%",
    status: "Disable",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=40&width=40",
    name: "Air Filter - WagonR 2015 CNG",
    sku: "TOP-FIL-000123",
    currentSellingPrice: "₹450.00",
    BaseCost: "₹300.00",
    Margin: "20.0%",
    status: "Active",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=40&width=40",
    name: "Oil Filter - Dzire 2017 Diesel",
    sku: "TOP-FIL-000124",
    currentSellingPrice: "₹300.00",
    BaseCost: "₹200.00",
    Margin: "18.0%",
    status: "Pending",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=40&width=40",
    name: "Spark Plug - Celerio 2019 Petrol",
    sku: "TOP-IGN-000001",
    currentSellingPrice: "₹150.00",
    BaseCost: "₹100.00",
    Margin: "25.0%",
    status: "Active",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {status}
        </Badge>
      );
    case "Disable":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {status}
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function PriceAndMarginEdit() {
  const route = useRouter();
  const payload = getTokenPayload();
  const isAllowed = payload?.role === "Inventory-Admin" || payload?.role === "Super-admin";
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);



  const handleSelectProduct = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (event.target.checked) {
      setSelectedProductIds((prev) => [...prev, id]);
    } else {
      setSelectedProductIds((prev) => prev.filter((productId) => productId !== id));
    }
  };

  useEffect(() => {
    const response = getProducts();
    response.then((data) => {
      console.log("Fetched Products:", data);
    }).catch((error) => {
      console.error("Error fetching products:", error);
    });
  }, []);
  const handleSaveProduct = () => {
    route.push(`/user/dashboard/product/Addproduct`);
  };

  const formSchema = z.object({
    baseCost: z.string().min(1, { message: "Base Cost is required" }),
    designMargin: z.string().min(1, { message: "Design Margin is required" }),
    autoCalculatedPrice: z.string().optional(),
    chargeTax:  z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseCost: "",
      designMargin: "",
      autoCalculatedPrice: "",
      chargeTax: false,
    },
  });

  const { watch, setValue } = form;
  const baseCost = watch("baseCost");
  const designMargin = watch("designMargin");

  useEffect(() => {
    if (baseCost && designMargin) {
      const calculatedPrice = parseFloat(baseCost) * (1 + parseFloat(designMargin) / 100);
      setValue("autoCalculatedPrice", calculatedPrice.toFixed(2));
    } else {
      setValue("autoCalculatedPrice", "");
    }
  }, [baseCost, designMargin, setValue]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="w-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <Card className="shadow-sm rounded-none ">
        <CardHeader className="space-y-6">
          {/* Search and Actions Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Side - Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="space-y-2">
                <CardTitle className=" text-black h6">
                  {products[0].name} {getStatusBadge(products[0].status)}
                </CardTitle>
                <CardDescription className="b2 text-gray-600">
                  SKU: {products[0].sku} <br />
                  <span className="text-gray-400 text-xs">
                    Created: {products[0].createdDate} . Last Updated: {products[0].updatedDate}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
                onClick={handleSaveProduct}
                // disabled={!isAllowed}
              >
                <span className="b3 font-RedHat">Save</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="flex flex-col lg:flex-row gap-4 px-4">
          <CardContent className=" lg:w-[30%] border-r border-gray-300  shadow-sm rounded-2xl">
            <img
              src={products[0].image}
              alt={products[0].name}
              className="w-full h-auto object-cover rounded-md"
            />
          </CardContent>
          <CardContent className="w-full lg:w-[70%]  border-r border-gray-200 shadow-sm rounded-2xl">
            <CardTitle className="mt-4">Basic Product Information</CardTitle>
            <CardDescription className="text-sm text-gray-500 mb-4">
              the core identifiers that define the product’s identity, brand, and origin.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium text-gray-700">SKU Code</p>
                <p className="text-base text-gray-900">{products[0].sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Product Name</p>
                <p className="text-base text-gray-900">{products[0].name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Manufacturer Part Number (MPN) </p>
                <p className="text-base text-gray-900">{products[0].currentSellingPrice}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">HSN code</p>
                <p className="text-base text-gray-900">{products[0].BaseCost}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Brand</p>
                <p className="text-base text-gray-900">{products[0].Margin}</p>
              </div>
            </div>
          </CardContent>
        </div>
        <div>
          <CardContent className="flex flex-col flex-start mt-4 ">
            <CardTitle className="text-lg font-bold">Pricing</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Classify the product for catalog structure, filterability, and business logic.
            </CardDescription>
            <Form {...form}>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="baseCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Cost</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter Base Cost" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Design Margin (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter Design Margin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="autoCalculatedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto-Calculated Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Calculated Price" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
              control={form.control}
              name="chargeTax"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value: string) => field.onChange(value === "true")}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex flex-row space-x-1"
                    >
                      <RadioGroupItem value="true" id="chargeTax" />
                    </RadioGroup>
                  </FormControl>
                  <FormLabel htmlFor="chargeTax" className="font-normal cursor-pointer">
                    Charge tax for this Product
                  </FormLabel>
                </FormItem>
              )}
            />
         
                
              
            </Form>
          </CardContent>

          <CardContent className="mt-7 px-4 w-[30%]">
            <CardTitle>Pricing Details</CardTitle>
            <CardDescription> The pricing and tax information required for listing and billing.</CardDescription>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-700">MRP (with GST)</p>
                <p className="text-base text-gray-900">₹1,099.00</p>
              </div>
                 <div>
                <p className="text-sm font-medium text-gray-700">GST %</p>
                <p className="text-base text-gray-900">18</p>
              </div>
              </div>
          </CardContent>
        </div>
     
      </Card> </form>
    </div>
  );
}
