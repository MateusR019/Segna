import { MetadataRoute } from "next";

const APP_URL = "https://segna.space";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacidade"],
        // App pages requerem login — não faz sentido indexar
        disallow: [
          "/dashboard",
          "/financas",
          "/habitos",
          "/notas",
          "/defi",
          "/tarefas",
          "/revisao",
          "/corporal",
          "/configuracoes",
          "/ajuda",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
