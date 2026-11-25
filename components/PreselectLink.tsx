"use client";

import type { AnchorHTMLAttributes } from "react";
import { preselectService } from "@/lib/preselect";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { service: number };

/** A link to the contact form that marks `service` in step 1 on the way there. */
export function PreselectLink({ service, onClick, href = "#contacto", ...rest }: Props) {
  return (
    <a
      href={href}
      onClick={(e) => {
        preselectService(service);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
