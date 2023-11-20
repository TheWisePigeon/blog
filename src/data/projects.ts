export type Project = {
  title: string;
  techs: string[];
  link: string;
  isComingSoon?: boolean;
};

const projects: Project[] = [
  {
    title: "Visio - Cloud based services providing face recognition features",
    techs: ["Golang", "Sveltekit", "postgres"],
    link: "https://getvisio.cloud"
  },
  {
    title: "YOOT - Minimalist Content management system",
    techs: ["Sveltekit", "TypeScript", "Bun", "postgres", "redis"],
    link: "https://yootcms.xyz"
  },
];

export default projects;
