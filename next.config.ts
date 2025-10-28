import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async redirects() {
    return [
      {
        source: "/league",
        destination:
          "https://docs.google.com/spreadsheets/d/1FwNEMlF1KPdVADiPP539y2a2mDiyHpmoQclALHK9nCA/edit?gid=521253915#gid=521253915",
        permanent: true,
      },
      {
        source: "/cast/:id",
        destination: "/room/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
