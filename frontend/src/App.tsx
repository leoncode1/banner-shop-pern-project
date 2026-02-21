// import { useEffect, useState } from "react";
// import {
//   fetchBannerOptions,
//   fetchAddOns,
//   createOrder
// } from "./api";

// // State: data that can change over time.
// // useState stores data and re-renders UI when it changes.

// function App() {

//   const [isLoading, setIsLoading] = useState(true);

//   // Initially, bannerOptions & addOns = [], []
//   const [bannerOptions, setBannerOptions] = useState<any[]>([]);
//   const [addOns, setAddOns] = useState<any[]>([]);

//   // These store User choices. Updates as User clicks them.
//   const [selectedBanner, setSelectedBanner] = useState("");
//   const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

//   // These store form input values.
//   const [email, setEmail] = useState("");
//   const [notes, setNotes] = useState("");

//   const isFormValid = email.trim() !== "" && selectedBanner !== "";

//   // Fetches data from backend when page first loads.
//   useEffect(() => {

//     Promise.all([fetchBannerOptions(), fetchAddOns()])
//       .then(([banners, addOns]) => {
//         setBannerOptions(banners);
//         setAddOns(addOns);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });

//     // Fetch data then store them in state.
//     // fetchBannerOptions().then(setBannerOptions);
//     // fetchAddOns().then(setAddOns);
      

//   }, []); // [] means to run the function once.

//   const toggleAddOn = (id: string) => {
//     setSelectedAddOns((prev) =>
//       prev.includes(id)
//         ? prev.filter((a) => a !== id)
//         : [...prev, id]
//     );
//   };

//   const submitOrder = async () => {

//     if (!isFormValid){
//       alert("Please complete required fields.");
//       return;
//     }

//     await createOrder({
//       // Change from customerEmail to guestEmail
//       guestEmail: email,
//       bannerOptionId: selectedBanner,
//       addOnIds: selectedAddOns,
//       notes
//     });

//     alert("Order placed successfully!");
//   };

//   if(isLoading){
//     return <p>Loading banner options...</p>
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Banner Order</h1>

//       <input
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <h2>Banner Options</h2>
//       {bannerOptions.map((b) => (
//         <div key={b.id}>
//           <label>
//             <input
//               type="radio"
//               name="banner"
//               value={b.id}
//               onChange={() => setSelectedBanner(b.id)}
//             />
//             {b.tier} ({b.widthFt}x{b.heightFt}) – ${b.basePrice / 100}
//           </label>
//         </div>
//       ))}

//       <h2>Add-ons</h2>
//       {addOns.map((a) => (
//         <div key={a.id}>
//           <label>
//             <input
//               type="checkbox"
//               checked={selectedAddOns.includes(a.id)}
//               onChange={() => toggleAddOn(a.id)}
//             />
//             {a.name} (+${a.price / 100})
//           </label>
//         </div>
//       ))}

//       <textarea
//         placeholder="Notes"
//         value={notes}
//         onChange={(e) => setNotes(e.target.value)}
//       />

//       <br />
//       {email.trim() === "" && (
//         <p style={{color: "red"}}>Email is required.</p>
//       )}

//       {selectedBanner === "" && (
//         <p style={{color: 'red'}}>Please select a banner.</p>
//       )}

//       <button 
//         onClick={submitOrder}
//         disabled={!isFormValid}
//       >
//           Place Order
//       </button>
//     </div>
//   );
// }

import {Routes, Route, Link} from "react-router-dom";
import OrderForm from "./components/OrderForm";
import Login from "./pages/Login";

function App(){
  return (
    <div style={{ padding: 20 }}>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/order">Place Order</Link> |{" "}
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Welcome</h1>} />
        <Route path="/order" element={<OrderForm />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

