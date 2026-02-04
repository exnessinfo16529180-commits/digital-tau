export type Category = "AI/ML" | "IoT" | "Web" | "Mobile" | "VR/AR"

export interface Project {
  id: string
  titleKey: string
  descKey: string
  category: Category
  techStack: string[]
  image: string
  status: "active" | "draft"
}

export const projects: Project[] = [
  {
    id: "1",
    titleKey: "medicalAiTitle",
    descKey: "medicalAiDesc",
    category: "AI/ML",
    techStack: ["Python", "TensorFlow", "Keras"],
    image: "/projects/medical-ai.jpg",
    status: "active",
  },
  {
    id: "2",
    titleKey: "fieldSenseTitle",
    descKey: "fieldSenseDesc",
    category: "IoT",
    techStack: ["Node.js", "MQTT", "Arduino"],
    image: "/projects/fieldsense.jpg",
    status: "active",
  },
  {
    id: "3",
    titleKey: "eduWebTitle",
    descKey: "eduWebDesc",
    category: "Web",
    techStack: ["React", "Node.js", "MongoDB"],
    image: "/projects/eduweb.jpg",
    status: "active",
  },
  {
    id: "4",
    titleKey: "mobileLearnTitle",
    descKey: "mobileLearnDesc",
    category: "Mobile",
    techStack: ["React Native", "Firebase", "Redux"],
    image: "/projects/mobilelearn.jpg",
    status: "active",
  },
  {
    id: "5",
    titleKey: "vrCampusTitle",
    descKey: "vrCampusDesc",
    category: "VR/AR",
    techStack: ["Unity", "C#", "Oculus SDK"],
    image: "/projects/vr-campus.jpg",
    status: "active",
  },
]

export interface Technology {
  name: string
  icon: string
  color: string
}

export const technologies: Technology[] = [
  { name: "React", icon: "react", color: "#61DAFB" },
  { name: "Python", icon: "python", color: "#14B8A6" },
  { name: "Node.js", icon: "nodejs", color: "#9F2F55" },
  { name: "TensorFlow", icon: "tensorflow", color: "#7A1F3D" },
  { name: "Arduino", icon: "arduino", color: "#6B7280" },
  { name: "Unity", icon: "unity", color: "#A855F7" },
  { name: "MongoDB", icon: "mongodb", color: "#22C55E" },
  { name: "PostgreSQL", icon: "postgresql", color: "#3B82F6" },
]

export const categories: Category[] = ["AI/ML", "IoT", "Web", "Mobile", "VR/AR"]

export const stats = {
  projects: 150,
  students: 2500,
  technologies: 45,
}
