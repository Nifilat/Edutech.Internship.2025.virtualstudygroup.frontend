import React from "react";

const Mic = ({ active = false, ...props }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.9999 21.9998V18.8389"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9996 14.8481V14.8481C9.75637 14.8481 7.9375 13.0218 7.9375 10.7682V6.08095C7.9375 3.82732 9.75637 2 11.9996 2C14.2438 2 16.0617 3.82732 16.0617 6.08095V10.7682C16.0617 13.0218 14.2438 14.8481 11.9996 14.8481Z"
        stroke="#D45738"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 10.8008C20 15.2396 16.4188 18.8385 11.9995 18.8385C7.58117 18.8385 4 15.2396 4 10.8008"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Mic;
