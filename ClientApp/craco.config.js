const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/pages": path.resolve(__dirname, "src/pages"),
      "@/utils": path.resolve(__dirname, "src/utils"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@/assets": path.resolve(__dirname, "src/assets"),
      "@/styles": path.resolve(__dirname, "src/assets/styles"),
      "@/contexts": path.resolve(__dirname, "src/contexts"),
      "@/hooks": path.resolve(__dirname, "src/hook"),
      "@/config": path.resolve(__dirname, "src/config"),
    },
  },
  jest: {
    configure: {
      moduleNameMapping: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@/components/(.*)$": "<rootDir>/src/components/$1",
        "^@/pages/(.*)$": "<rootDir>/src/pages/$1",
        "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@/services/(.*)$": "<rootDir>/src/services/$1",
        "^@/assets/(.*)$": "<rootDir>/src/assets/$1",
        "^@/styles/(.*)$": "<rootDir>/src/assets/styles/$1",
        "^@/contexts/(.*)$": "<rootDir>/src/contexts/$1",
        "^@/hooks/(.*)$": "<rootDir>/src/hook/$1",
        "^@/config/(.*)$": "<rootDir>/src/config/$1",
      },
    },
  },
};
