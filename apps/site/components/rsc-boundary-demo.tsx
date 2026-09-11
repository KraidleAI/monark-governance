"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * RSC-boundary oracle: a Base UI client component (Dialog + Button, "use client")
 * rendered inside the server page app/page.tsx. The oracle is `next build` exit 0 with this client
 * boundary compiled. Runtime hydration is a MANUAL `next dev` acceptance check — NOT covered by
 * `next build` — declared here as such, not claimed as tested.
 */
export function RscBoundaryDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>About MONARK</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MONARK</DialogTitle>
          <DialogDescription>
            Public foundation preview, built on Base UI primitives with a navy and gold design
            system.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
