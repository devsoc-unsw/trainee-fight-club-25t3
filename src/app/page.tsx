import Image from "next/image";
import HeroSection from "./landing/components/hero-section";
import Features from "./landing/components/features-3";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <Features />
    </div>
  ); 
}