"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Services from "@/components/Services";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import BookingModal from "@/components/BookingModal";
import type { ClinicData } from "@/data/clinic";
import { usePublicLanding } from "@/lib/hooks/use-public-landing";

interface HomePageProps {
  clinicData: ClinicData;
}

export default function HomePage({ clinicData }: HomePageProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const landing = usePublicLanding();
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <Hero landing={landing} />
      <Marquee landing={landing} />
      <Services landing={landing} />
      <About landing={landing} />
      <Gallery landing={landing} />
      <Contact landing={landing} onOpenBooking={openBooking} clinic={clinicData} />
      <FloatingBookingButton onOpenBooking={openBooking} />
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}
