import nextConfig from "eslint-config-next"

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "public/**", ".claude/**"],
  },
]

export default eslintConfig
