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

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <About />
      <Gallery />
      <Contact onOpenBooking={openBooking} />
      <FloatingBookingButton onOpenBooking={openBooking} />
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}
