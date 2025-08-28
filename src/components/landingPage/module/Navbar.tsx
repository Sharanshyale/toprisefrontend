"use client";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
// import { GitHubLogoIcon } from "@radix-ui/react-icons";
// import { buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import DynamicButton from "@/components/common/button/button";
import logo from "../../../../public/assets/logo.png";
import Image from "next/image";

import ContactDialog from "./popup/contactus";
// import { ModeToggle } from "./mode-toggle";
// import { LogoIcon } from "./Icons";

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

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const router = useRouter();
  const handleShopNow = ()=>{
    router.replace("/shop");
  }
  const handleSLAFormSubmit = (data: any) => {
    setContactUsOpen(false);
  };

return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-lg sm:text-xl flex cursor-pointer"
            >
              <Image src={logo} alt="Logo" className="hover:opacity-80 transition-opacity" />
            </a>
          </NavigationMenuItem>

          {/* Mobile menu */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                />
              </SheetTrigger>

              <SheetContent side={"left"} className="w-full sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="font-bold text-lg sm:text-xl">
                    <a
                      rel="noreferrer noopener"
                      href="/"
                      className="cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image src={logo} alt="Logo" width={40} height={40} className="hover:opacity-80 transition-opacity" />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-5 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="font-semibold font-sans text-[#1A1A1A] hover:text-gray-600 transition-colors text-sm lg:text-base whitespace-nowrap"
                    >
                      {label}
                    </a>
                  ))}
                  <DynamicButton
                    variant="default"
                    className="mt-2 w-full py-2 text-sm rounded-md shadow bg-[#C72920] text-white font-semibold active:scale-95 transition-transform"
                    text="Contact Us"
                    onClick={() => {
                      setContactUsOpen(true);
                      setIsOpen(false);
                    }}
                  />
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop/Tablet menu */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className="font-semibold font-sans text-[#1A1A1A] hover:text-gray-600 transition-colors text-sm lg:text-base whitespace-nowrap"
              >
                {route.label}
              </a>
            ))}
            <DynamicButton
              variant="default"
              className="ml-2 bg-[#C72920] text-sm lg:text-base px-3 py-1 lg:px-4 lg:py-2"
              text="Contact Us"
              onClick={() => setContactUsOpen(true)}
            />
              <DynamicButton
              variant="default"
              className="ml-2 bg-[#C72920] text-sm lg:text-base px-3 py-1 lg:px-4 lg:py-2"
              text="Shop now"
              onClick={handleShopNow}
            />
          </nav>
        </NavigationMenuList>
      </NavigationMenu>
      <ContactDialog
        open={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />
    </header>
  );
};
