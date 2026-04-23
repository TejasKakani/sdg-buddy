export interface SDGGoal {
  id: number;
  name: string;
  description: string;
  color: string;
  logo: string;
}

export const SDG_GOALS: SDGGoal[] = [
  {
    id: 1,
    name: "No Poverty",
    description: "End poverty in all its forms everywhere.",
    color: "#E5243B",
    logo: "/SDG_ICONS/NO_POVERTY.jpg"
  },
  {
    id: 2,
    name: "Zero Hunger",
    description: "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    color: "#DDA63A",
    logo: "/SDG_ICONS/ZERO_HUNGER.jpg"
  },
  {
    id: 3,
    name: "Good Health and Well-being",
    description: "Ensure healthy lives and promote well-being for all at all ages.",
    color: "#4C9F38",
    logo: "/SDG_ICONS/GOOD_HEALTH_AND_WELL_BEING.jpg"
  },
  {
    id: 4,
    name: "Quality Education",
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    color: "#C5192D",
    logo: "/SDG_ICONS/QUALITY_EDUCATION.jpg"
  },
  {
    id: 5,
    name: "Gender Equality",
    description: "Achieve gender equality and empower all women and girls.",
    color: "#FF3A21",
    logo: "/SDG_ICONS/GENDER_EQUALITY.jpg"
  },
  {
    id: 6,
    name: "Clean Water and Sanitation",
    description: "Ensure availability and sustainable management of water and sanitation for all.",
    color: "#26BDE2",
    logo: "/SDG_ICONS/CLEAN_WATER_AND_SANITATION.jpg"
  },
  {
    id: 7,
    name: "Affordable and Clean Energy",
    description: "Ensure access to affordable, reliable, sustainable and modern energy for all.",
    color: "#FCC30B",
    logo: "/SDG_ICONS/AFFORDABLE_AND_CLEAN_ENERGY.jpg"
  },
  {
    id: 8,
    name: "Decent Work and Economic Growth",
    description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.",
    color: "#A21942",
    logo: "/SDG_ICONS/DECENT_WORK_AND_ECONOMIC_GROWTH.jpg"
  },
  {
    id: 9,
    name: "Industry, Innovation and Infrastructure",
    description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
    color: "#FD6925",
    logo: "/SDG_ICONS/INDUSTRY_INNOVATION_AND_INFRASTRUCTURE.jpg"
  },
  {
    id: 10,
    name: "Reduced Inequality",
    description: "Reduce inequality within and among countries.",
    color: "#DD1367",
    logo: "/SDG_ICONS/REDUCED_INEQUALITIES.jpg"
  },
  {
    id: 11,
    name: "Sustainable Cities and Communities",
    description: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
    color: "#FD9D24",
    logo: "/SDG_ICONS/SUSTAINABLE_CITIES_AND_COMMUNITIES.jpg"
  },
  {
    id: 12,
    name: "Responsible Consumption and Production",
    description: "Ensure sustainable consumption and production patterns.",
    color: "#BF8B2E",
    logo: "/SDG_ICONS/RESPONSIBLE_CONSUMPTION_AND_PRODUCTION.jpg"
  },
  {
    id: 13,
    name: "Climate Action",
    description: "Take urgent action to combat climate change and its impacts.",
    color: "#3F7E44",
    logo: "/SDG_ICONS/CLIMATE_ACTION.jpg"
  },
  {
    id: 14,
    name: "Life Below Water",
    description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development.",
    color: "#0A97D9",
    logo: "/SDG_ICONS/LIFE_BELOW_WATER.jpg"
  },
  {
    id: 15,
    name: "Life on Land",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems, manage forests sustainably, combat desertification, and halt biodiversity loss.",
    color: "#56C02B",
    logo: "/SDG_ICONS/LIFE_ON_LAND.jpg"
  },
  {
    id: 16,
    name: "Peace, Justice and Strong Institutions",
    description: "Promote peaceful and inclusive societies, provide access to justice for all, and build effective, accountable institutions.",
    color: "#00689D",
    logo: "/SDG_ICONS/PEACE_JUSTICE_AND_STRONG_INSTITUTIONS.jpg"
  },
  {
    id: 17,
    name: "Partnerships for the Goals",
    description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
    color: "#19486A",
    logo: "/SDG_ICONS/E_SDG_PRINT-17.jpg"
  }
];

// Helper function to get color by goal ID
export const getSDGColor = (id: number): string => {
  const goal = SDG_GOALS.find(g => g.id === id);
  return goal ? goal.color : "#000000";
};

// Helper function to get goal name by ID
export const getSDGName = (id: number): string => {
  const goal = SDG_GOALS.find(g => g.id === id);
  return goal ? goal.name : "Unknown Goal";
};

// Helper function to get goal description by ID
export const getSDGDescription = (id: number): string => {
  const goal = SDG_GOALS.find(g => g.id === id);
  return goal ? goal.description : "";
};

export const getSDGLogo = (id: number): string => {
  const goal = SDG_GOALS.find(g => g.id === id);
  return goal ? goal.logo : "";
};
