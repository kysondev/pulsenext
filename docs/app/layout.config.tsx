import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image
          src="/phizy-stack.svg"
          alt="Phizy Stack"
          width={15}
          height={15}
        />
        Phizy Stack
      </>
    ),
  },
  links: [],
};
