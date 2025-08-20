import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <img
      src="/icon.png"
      alt="Logo"
      {...(props as any)}
    />
  ),
};
