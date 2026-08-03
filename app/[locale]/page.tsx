import { getClinicData } from "@/data/clinic";
import HomePage from "@/components/HomePage";

export default async function Page() {
  const clinicData = await getClinicData();
  return <HomePage clinicData={clinicData} />;
}
