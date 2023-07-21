export type Project = {
  title: string;
  techs: string[];
  link: string;
  isComingSoon?: boolean;
};

const projects: Project[] = [
  {
    title: "YOOT - Minimalist Content management system",
    techs: ["Sveltekit", "TypeScript", "Express", "Bun", "postgres", "redis"],
    link: "https://github.com/MaeWolff/dictionary-app",
  },
  {
    title: "Portfolio / Lina BLIDI",
    techs: ["ReactJS (NextJS)", "TypeScript"],
    link: "https://www.linablidi.fr/",
  },
  {
    title: "Portfolio / Template",
    techs: ["Astro"],
    link: "/",
    isComingSoon: true,
  },
];

export default projects;
