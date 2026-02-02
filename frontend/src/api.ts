const API_BASE_URL = "http://localhost:5001/api";

export async function fetchBannerOptions() {
  const res = await fetch(`${API_BASE_URL}/banner-options`);
  if (!res.ok) throw new Error("Failed to fetch banner options");
  return res.json();
}

export async function fetchAddOns() {
  const res = await fetch(`${API_BASE_URL}/add-ons`);
  if (!res.ok) throw new Error("Failed to fetch add-ons");
  return res.json();
}


export async function createOrder(orderData: {
  customerEmail: string;
  bannerOptionId: string;
  addOnIds?: string[];
  notes?: string;
}) {

    // fetch sends HTTP request to backend using orderData
    // Then waits for a response. In the meantime, 
    // Express receives the req and calls createOrder(req, res)
    // Backend reads data and interacts with DB. Sends response
    // Fetch completes and is set = const res and res is returned as JSON
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  if (!res.ok) {
    throw new Error("Failed to create order");
  }

  return res.json();
}
