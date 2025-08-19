import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM12 12a4.5 4.5 0 1 1-4.5-4.5A4.5 4.5 0 0 1 12 12z" />
      <path d="M12 12a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 1 0v4.5a.5.5 0 0 1-.5.5z" />
    </svg>
  ),
};
