import AboutUs from "@/components/landingPage/module/AboutUs";
import Footer from "@/components/landingPage/module/Footer";
import HeroSection, { } from "@/components/landingPage/module/Hero";
import { Navbar } from "@/components/landingPage/module/Navbar";
import Homepage from "@/components/webapp/Homepage";
import { Header } from "@/components/webapp/layout/Header";
import BannerSection from "@/components/webapp/modules/pages/Home/banner/Banner";

const Page = () => {
  return (
    <>
      <Header />
      <BannerSection/>
     <Homepage/>
      <Footer/>

    </>
  );
};

export default Page;
