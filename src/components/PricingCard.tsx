import Link from 'next/link';
import Icon from './Icon';

export interface PricingFeature {
  name: string;
  tooltip: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  isPopular?: boolean;
  features: { name: string; tooltip: string }[];
  onOrder?: (title: string, features: string[], price: string) => void;
  className?: string;
  period?: string; // e.g. "/month" — leave unset for once-off packages
}

export default function PricingCard({ title, price, description, isPopular, features, onOrder, className = '', period, buttonText = 'Order Now' }: PricingCardProps) {
  
  return (
    <div className={`relative w-full max-w-[345px] bg-td-purple rounded-[10px] text-white py-4 flex flex-col mx-auto shadow-[0px_5px_15px_rgba(0,0,0,0.2)] ${isPopular ? 'min-h-[580px] scale-105 z-10 mt-4' : 'min-h-[550px] mt-0 lg:mt-8'} ${className}`}>
      
      <h4 className="text-[20px] font-[700] text-center uppercase tracking-wide px-2">
        {title}
      </h4>

      <div className="bg-td-accent rounded-r-[10px] py-[3px] px-[25px] text-[25px] font-[700] my-[15px] w-max self-start shadow-md flex items-baseline">
        <span className="align-super text-[1rem] mr-1">R</span>
        {price}
        {period && <span className="text-[14px] font-normal ml-1">{period}</span>}
      </div>

      <p className="text-center font-[500] text-[14px] px-6 text-gray-200">
        {description}
      </p>

      <hr className="w-[25%] border-td-accent border-t-[2.8px] mx-auto mt-[15px] opacity-100" />

      <ul className="flex flex-col items-start mx-auto mt-[15px] mb-20 w-full px-8">
        {features.map((feature, idx) => (
          // Pure CSS Group-Hover Tooltip 
          <li key={idx} className="relative flex items-start text-[14px] my-[6px] font-light group w-full cursor-help">
            <Icon name="info" size={14} className="-info-circle !p-0 !text-td-accent !mr-[8px] !mt-[3px] !text-[14px] flex-shrink-0" />
            <span className="leading-snug">{feature.name}</span>
            
            {/* The Tooltip Box */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-[220px] bg-white text-td-purple font-medium text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none border-b-4 border-td-accent">
              {feature.tooltip}
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
            </div>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => onOrder && onOrder(title, features.map(f => f.name), period ? `${price}${period}` : price)} 
        className="mt-6 w-full py-3 px-4 bg-td-purple hover:bg-td-accent text-white font-bold rounded transition duration-200"
      >
        {buttonText}
      </button>

    </div>
  );
}