export type Project = {
  title: string;
  techs: string[];
  link: string;
  isComingSoon?: boolean;
};

const projects: Project[] = [
  {
    title: "YOOT - Minimalist Content management system",
    techs: ["Sveltekit", "TypeScript", "Bun", "postgres", "redis"],
    link: "https://github.com/TheWisePigeon/yoot"
  },
  {
    title: "kuchiyose - Project bootstraper",
    techs : ["JavaScript", "NPM", "Github actions"],
    link: "https://github.com/TheWisePigeon/kuchiyose"
  },
  {
    title: "Squils - SQL databases utility cli",
    techs : ["JavaScript", "NPM", "Github actions"],
    link: "https://github.com/TheWisePigeon/squils"
  },  
  {
    title: "Certus - HTTP test runner",
    techs : ["Rust"],
    link: "https://github.com/TheWisePigeon/certus"
  },
];

export default projects;
