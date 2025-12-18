import Image from "next/image";
import HeroSection from "./landing/components/hero-section";
import Features from "./landing/components/features-3";
import FooterSection from "./landing/components/footer";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <Features />
      <FooterSection />
    </div>
  ); 
}