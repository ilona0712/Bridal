import { supabase } from "../../lib/supabase";
import { sendPushNotification } from "./pushNotificationService";

type RentalStatus = "pending" | "reviewed" | "confirmed" | "rejected" | "returned";

export async function updateRentalStatusWithNotification(
  rentalId: string,
  status: RentalStatus,
) {
  const { error } = await supabase
    .from("rentals")
    .update({ status })
    .eq("id", rentalId);

  if (error) {
    throw new Error(`Failed to update rental status: ${error.message}`);
  }

  await sendPushNotification({
    type: "rental_status_updated",
    rentalId,
    rentalStatus: status,
  });
}
