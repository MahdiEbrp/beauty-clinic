"use client";

import { useRouter } from "@/src/i18n/navigation";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import type { ClinicData } from "@/data/clinic";
import { usePublicLanding } from "@/lib/hooks/use-public-landing";

interface HomePageProps {
  clinicData: ClinicData;
}

export default function HomePage({ clinicData }: HomePageProps) {
  const router = useRouter();
  const landing = usePublicLanding();
  const openBooking = () => router.push("/booking");

  return (
    <>
      <Hero landing={landing} />
      <Marquee landing={landing} />
      <Services landing={landing} />
      <About landing={landing} />
      <Gallery landing={landing} />
      <Contact landing={landing} onOpenBooking={openBooking} clinic={clinicData} />
      <FloatingBookingButton />
    </>
  );
}
