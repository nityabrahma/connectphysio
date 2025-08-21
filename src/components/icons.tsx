import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        d="M168 40.7a48 48 0 10-80 0m-4.2 165.8a88 88 0 01-8.2-37.3c0-32.4 16.2-61.9 41.9-80.5"
      />
      <circle
        cx="128"
        cy="40"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        d="M65.7 101.4a88 88 0 01132.5 5.5c25.8 18.6 41.9 48.1 41.9 80.5a88 88 0 01-8.2 37.3m-124.2-1.5a44 44 0 0044.9 37.4 44.4 44.4 0 0044.9-37.4"
      />
    </svg>
  ),
};
