import path from "path";

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.modules.push(path.resolve("./"));
    return config;
  },
};

export default nextConfig;
