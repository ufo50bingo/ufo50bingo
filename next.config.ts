import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
        source: "/underground",
        destination:
          "https://docs.google.com/spreadsheets/d/1OocDHEbrJC3BqO8qrPFCYxyy2nzqAaTT6Hmix076Ea0/edit?gid=467172056#gid=467172056",
        permanent: true,
      },
      {
        source: "/spicy",
        destination:
          "https://docs.google.com/spreadsheets/d/1oQktL5q8eVWrI_Zbacjv-supFhuQI4h63tiVcMkan4E/edit?gid=1916787881#gid=1916787881",
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
