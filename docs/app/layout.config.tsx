import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image src="/pulsecli.svg" alt="PulseNext" width={15} height={15} />
        PulseNext
      </>
    ),
  },
  links: [],
};
