import { useEffect, useState } from "react";
import {
  fetchBannerOptions,
  fetchAddOns,
  createOrder
} from "../api";

import BannerOptions from "./BannerOptions";
import AddOnsList from "./AddOnsList";

const OrderForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bannerOptions, setBannerOptions] = useState<any[]>([]);
  const [addOns, setAddOns] = useState<any[]>([]);

  const [selectedBanner, setSelectedBanner] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const isFormValid = email.trim() !== "" && selectedBanner !== "";

  useEffect(() => {
    Promise.all([fetchBannerOptions(), fetchAddOns()])
      .then(([banners, addOns]) => {
        setBannerOptions(banners);
        setAddOns(addOns);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id)
        ? prev.filter((a) => a !== id)
        : [...prev, id]
    );
  };

  const submitOrder = async () => {
    if (!isFormValid) return;

    try {
      setIsSubmitting(true);

      const order = await createOrder({
        guestEmail: email,
        bannerOptionId: selectedBanner,
        addOnIds: selectedAddOns,
        notes
      });

      alert(`Order placed! Order #${order.orderNumber}`);

      // Reset form
      setEmail("");
      setSelectedBanner("");
      setSelectedAddOns([]);
      setNotes("");

    } catch (error) {
      alert("Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading banner options...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Banner Order</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <BannerOptions
        options={bannerOptions}
        selectedBanner={selectedBanner}
        onSelect={setSelectedBanner}
      />

      <AddOnsList
        addOns={addOns}
        selectedAddOns={selectedAddOns}
        toggleAddOn={toggleAddOn}
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={submitOrder}
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderForm;
