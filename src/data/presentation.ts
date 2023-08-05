type Social = {
  label: string;
  link: string;
};

type Presentation = {
  mail: string;
  title: string;
  description: string;
  socials: Social[];
};

const presentation: Presentation = {
  mail: "josephdogbevi2002@gmail.com",
  title: "Hi, I’m Joseph aka TheWisePigeon",
  description:
    "I'm a passionate *software developer* and relentless problem solver. *I love Open Source* and spend most of my free time working on side projects. I also write about tech stuff",
  socials: [
    {
      label: "Github",
      link: "https://github.com/TheWisePigeon",
    },
    {
      label:"Bento",
      link:"https://bento.me/thewisepigeon"
    },
    {
      label:"CV",
      link:"/cv.html"
    }
  ],
};

export default presentation;
