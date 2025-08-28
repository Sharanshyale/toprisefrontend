"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { CartSidebar } from "./CartSideBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/types/User/cart-Types";
import logo from "../../../../public/assets/logo.png";
import Image from "next/image";
import { LogOut } from "@/store/slice/auth/authSlice";
interface RouteProps {
  href: string;
  label: string;
}


const routeList: RouteProps[] = [
  {
    href: "/TermsAndConditions",
    label: "Terms & Conditions",
  },
  {
    href: "/PrivacyPolicy",
    label: "Privacy Policy",
  },
  {
    href: "/ShippingAndReturnPolicy",
    label: "Shipping & Returns Policy ",
  },

  //   {
  //     href: "#pricing",
  //     label: "Pricing",
  //   },
  //   {
  //     href: "#faq",
  //     label: "FAQ",
  //   },
];

export const Header = () => {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { 
    cartData: cart, 
    fetchCart, 
    updateItemQuantity, 
    removeItemFromCart 
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
const handleLogout = () => {
  Cookies.remove('token');
  Cookies.remove('role');
  Cookies.remove('lastlogin');

  localStorage.clear();
  sessionStorage.clear();
  dispatch(LogOut());
  router.replace('/shop');
  window.location.reload();
  }
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(itemId, newQuantity);
  };

  const removeFromCart = (itemId: string) => {
    removeItemFromCart(itemId);
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.product_total, 0);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-lg sm:text-xl flex cursor-pointer"
            >
              <Image
                src={logo}
                alt="Logo"
                className="hover:opacity-80 transition-opacity"
              />
            </a>
            
          </NavigationMenuItem>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Spare parts"
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-red-600 hover:bg-red-700 text-white rounded-md px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <CartSidebar
              cart={cart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              handleQuantityChange={handleQuantityChange}
              removeFromCart={removeFromCart}
              calculateTotal={calculateTotal}
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600"
              onClick={handleLogout}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
