import React from "react";

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface Props {
  addOns: AddOn[];
  selectedAddOns: string[];
  toggleAddOn: (id: string) => void;
}

const AddOnsList: React.FC<Props> = ({
  addOns,
  selectedAddOns,
  toggleAddOn
}) => {
  return (
    <>
      <h2>Add-ons</h2>
      {addOns.map((a) => (
        <div key={a.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedAddOns.includes(a.id)}
              onChange={() => toggleAddOn(a.id)}
            />
            {a.name} (+${a.price / 100})
          </label>
        </div>
      ))}
    </>
  );
};

export default AddOnsList;
