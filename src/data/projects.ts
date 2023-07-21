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
    link: "https://github.com/TheWisePigeon/yoot",
    isComingSoon: true
  },
  {
    title: "kuchiyose - Project bootstraper",
    techs : ["JavaScript", "NPM", "Github actions"],
    link: "https://github.com/TheWisePigeon/kuchiyose"
  },
];

export default projects;
