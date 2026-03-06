import Hero from "@/modules/home/components/Hero";
import Features from "@/modules/home/components/Features";
import HowItWorks from "@/modules/home/components/HowItWorks";
import Testimonials from "@/modules/home/components/Testimonials";
import CTA from "@/modules/home/components/CTA";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  );
}
