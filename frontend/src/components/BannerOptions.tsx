import React from "react";

interface BannerOption {
  id: string;
  tier: string;
  widthFt: number;
  heightFt: number;
  basePrice: number;
}

interface Props {
  options: BannerOption[];
  selectedBanner: string;
  onSelect: (id: string) => void;
}

const BannerOptions: React.FC<Props> = ({
  options,
  selectedBanner,
  onSelect
}) => {
  return (
    <>
      <h2>Banner Options</h2>
      {options.map((b) => (
        <div key={b.id}>
          <label>
            <input
              type="radio"
              name="banner"
              value={b.id}
              checked={selectedBanner === b.id}
              onChange={() => onSelect(b.id)}
            />
            {b.tier} ({b.widthFt}x{b.heightFt}) – ${b.basePrice / 100}
          </label>
        </div>
      ))}
    </>
  );
};

export default BannerOptions;
