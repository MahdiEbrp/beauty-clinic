"use client";

import { useRouter } from "@/src/i18n/navigation";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import type { ClinicData } from "@/data/clinic";
import type { PublicLanding } from "@/lib/landing";

interface HomePageProps {
  clinicData: ClinicData;
  landing: PublicLanding | null;
}

export default function HomePage({ clinicData, landing }: HomePageProps) {
  const router = useRouter();
  const openBooking = () => router.push("/booking");

  return (
    <>
      <Hero landing={landing} />
      <Marquee landing={landing} />
      <About landing={landing} />
      <Gallery landing={landing} />
      <Contact landing={landing} onOpenBooking={openBooking} clinic={clinicData} />
      <FloatingBookingButton />
    </>
  );
}
