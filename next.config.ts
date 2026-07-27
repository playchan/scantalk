import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 홈 디렉터리의 다른 lockfile 때문에 워크스페이스 루트를 오인하는 문제 방지
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
