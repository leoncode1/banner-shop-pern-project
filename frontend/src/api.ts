const API_BASE_URL = "http://localhost:5001/api";

// export async function fetchBannerOptions() {
//   const res = await fetch(`${API_BASE_URL}/banner-options`);
//   if (!res.ok) throw new Error("Failed to fetch banner options");
//   return res.json();
// }

// export async function fetchAddOns() {
//   const res = await fetch(`${API_BASE_URL}/add-ons`);
//   if (!res.ok) throw new Error("Failed to fetch add-ons");
//   return res.json();
// }


// export async function createOrder(orderData: {
//   // Change customerEmail to guestEmail?
//   guestEmail?: string;
//   bannerOptionId: string;
//   addOnIds?: string[];
//   notes?: string;
// }) {

//     // fetch sends HTTP request to backend using orderData
//     // Then waits for a response. In the meantime, 
//     // Express receives the req and calls createOrder(req, res)
//     // Backend reads data and interacts with DB. Sends response
//     // Fetch completes and is set = const res and res is returned as JSON
//   const res = await fetch(`${API_BASE_URL}/orders`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(orderData)
//   });

//   if (!res.ok) {
//     throw new Error("Failed to create order");
//   }

//   return res.json();
// }

async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true
) {
  // Changed const to let
  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include", // Required for Cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    // Added so POST does not become GET
    ...options
  });
  //-------------------------------
  // Added for NO refreshing on /auth/me
  if(
    res.status === 401 &&
    retry &&
    !endpoint.startsWith("/auth/")
  ){
    try{
      // Attempt refresh
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`,{
        method: "POST",
        credentials: "include"
      });

      if (!refreshRes.ok){
        throw new Error("Refresh failed.");
      }

      //Retry original request ONCE
      return apiFetch(endpoint, options, false);
    } catch{
      throw new Error("Session expired.");
    }
  }

  if(!res.ok){
    throw new Error("API request failed.");
  }

  return res.json();
}

export async function fetchBannerOptions(){
  return apiFetch("/banner-options");
}

export async function fetchAddOns(){
  return apiFetch("/add-ons");
}

export async function createOrder(orderData: {
  guestEmail?: string;
  bannerOptionId: string;
  addOnIds?: string[];
  notes?: string;
}) {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  });
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include", // IMPORTANT
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
}

// Added for session persistence
export async function getMe(){
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include"
  });

  // Stop console error
  if(res.status === 401){
    return null; // not logged in
  }

  if (!res.ok){
    throw new Error("Failed to fetch user.");
  }

  return res.json();
}

// Added for silent refresh for accessToken expiry
export async function refreshSession(){
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok){
    throw new Error("Refresh failed");
  }

  return res.json();
}
