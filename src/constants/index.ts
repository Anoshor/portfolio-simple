// Type definitions
interface NavLink {
    id: number;
    name: string;
    href: string;
  }
  
  interface ClientReview {
    id: number;
    name: string;
    position: string;
    img: string;
    review: string;
  }
  
  interface Tag {
    id: number;
    name: string;
    path: string;
  }
  
  interface Project {
    title: string;
    desc: string;
    subdesc: string;
    href: string;
    texture: string;
    logo: string;
    logoStyle: {
      backgroundColor: string;
      border: string;
      boxShadow: string;
      background?: string; // Optional, as not all objects have it
    };
    spotlight: string;
    tags: Tag[];
  }
  
  interface WorkExperience {
    id: number;
    name: string;
    pos: string;
    duration: string;
    title: string;
    icon: string;
    animation: string;
  }
  
  // Nav links
  export const navLinks: NavLink[] = [
    { id: 1, name: 'Home', href: '#home' },
    { id: 2, name: 'About', href: '#about' },
    { id: 3, name: 'Work', href: '#work' },
    { id: 4, name: 'Contact', href: '#contact' },
  ];
  
  // Client reviews
  export const clientReviews: ClientReview[] = [
    {
      id: 1,
      name: 'Emily Johnson',
      position: 'Marketing Director at GreenLeaf',
      img: 'assets/review1.png',
      review:
        'Working with Adrian was a fantastic experience. He transformed our outdated website into a modern, user-friendly platform. His attention to detail and commitment to quality are unmatched. Highly recommend him for any web dev projects.',
    },
    {
      id: 2,
      name: 'Mark Rogers',
      position: 'Founder of TechGear Shop',
      img: 'assets/review2.png',
      review:
        'Adrian’s expertise in web development is truly impressive. He delivered a robust and scalable solution for our e-commerce site, and our online sales have significantly increased since the launch. He’s a true professional! Fantastic work.',
    },
    {
      id: 3,
      name: 'John Dohsas',
      position: 'Project Manager at UrbanTech ',
      img: 'assets/review3.png',
      review:
        'I can’t say enough good things about Adrian. He was able to take our complex project requirements and turn them into a seamless, functional website. His problem-solving abilities are outstanding.',
    },
    {
      id: 4,
      name: 'Ether Smith',
      position: 'CEO of BrightStar Enterprises',
      img: 'assets/review4.png',
      review:
        'Adrian was a pleasure to work with. He understood our requirements perfectly and delivered a website that exceeded our expectations. His skills in both frontend backend dev are top-notch.',
    },
  ];
  
  // Projects
  export const myProjects: Project[] = [
    {
      title: 'Podcastr - AI Podcast Platform',
      desc: 'Podcastr is a revolutionary Software-as-a-Service platform that transforms the way podcasts are created. With advanced AI-powered features like text-to-multiple-voices functionality, it allows creators to generate diverse voiceovers from a single text input.',
      subdesc:
        'Built as a unique Software-as-a-Service app with Next.js 14, Tailwind CSS, TypeScript, Framer Motion and Convex, Podcastr is designed for optimal performance and scalability.',
      href: 'https://www.youtube.com/watch?v=zfAb95tJvZQ',
      texture: '/textures/project/project1.mp4',
      logo: '/assets/project-logo1.png',
      logoStyle: {
        backgroundColor: '#2A1816',
        border: '0.2px solid #36201D',
        boxShadow: '0px 0px 60px 0px #AA3C304D',
      },
      spotlight: '/assets/spotlight1.png',
      tags: [
        { id: 1, name: 'React.js', path: '/assets/react.svg' },
        { id: 2, name: 'TailwindCSS', path: 'assets/tailwindcss.png' },
        { id: 3, name: 'TypeScript', path: '/assets/typescript.png' },
        { id: 4, name: 'Framer Motion', path: '/assets/framer.png' },
      ],
    },
    // Remaining projects (similar to the first one)
  ];
  
  // Calculate sizes
  export const calculateSizes = (
    isSmall: boolean,
    isMobile: boolean,
    isTablet: boolean
  ): {
    deskScale: number;
    deskPosition: [number, number, number];
    cubePosition: [number, number, number];
    reactLogoPosition: [number, number, number];
    ringPosition: [number, number, number];
    targetPosition: [number, number, number];
  } => {
    return {
      deskScale: isSmall ? 0.05 : isMobile ? 0.06 : 0.065,
      deskPosition: isMobile ? [0.5, -4.5, 0] : [0.25, -5.5, 0],
      cubePosition: isSmall ? [4, -5, 0] : isMobile ? [5, -5, 0] : isTablet ? [5, -5, 0] : [9, -5.5, 0],
      reactLogoPosition: isSmall ? [3, 4, 0] : isMobile ? [5, 4, 0] : isTablet ? [5, 4, 0] : [12, 3, 0],
      ringPosition: isSmall ? [-5, 7, 0] : isMobile ? [-10, 10, 0] : isTablet ? [-12, 10, 0] : [-24, 10, 0],
      targetPosition: isSmall
        ? [-5, -10, -10]
        : isMobile
        ? [-9, -10, -10]
        : isTablet
        ? [-11, -7, -10]
        : [-13, -13, -10],
    };
  };
  
  // Work experiences
  export const workExperiences: WorkExperience[] = [
    {
      id: 1,
      name: 'Framer',
      pos: 'Lead Web Developer',
      duration: '2022 - Present',
      title:
        'Framer serves as my go-to tool for creating interactive prototypes. I use it to bring designs to life, allowing stakeholders to experience the user flow and interactions before development.',
      icon: '/assets/framer.svg',
      animation: 'victory',
    },
    {
      id: 2,
      name: 'Figma',
      pos: 'Web Developer',
      duration: '2020 - 2022',
      title:
        'Figma is my collaborative design platform of choice. I utilize it to work seamlessly with team members and clients, facilitating real-time feedback and design iterations. Its cloud-based.',
      icon: '/assets/figma.svg',
      animation: 'clapping',
    },
    {
      id: 3,
      name: 'Notion',
      pos: 'Junior Web Developer',
      duration: '2019 - 2020',
      title:
        'Notion helps me keep my projects organized. I use it for project management, task tracking, and as a central hub for documentation, ensuring that everything from design notes to.',
      icon: '/assets/notion.svg',
      animation: 'salute',
    },
  ];
  