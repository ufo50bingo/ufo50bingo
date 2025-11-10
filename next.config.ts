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
        source: "/underground",
        destination:
          "https://docs.google.com/spreadsheets/d/1oeK9jmpnEDk0LOeWk4biX-6SQRK5fmB9kthmeTUBSDs/edit?gid=650064227#gid=650064227",
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
