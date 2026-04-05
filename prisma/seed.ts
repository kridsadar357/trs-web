import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (in order of dependencies)
  await prisma.contactSubmission.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.page.deleteMany();
  await prisma.siteSetting.deleteMany();
  console.log("Cleared existing data");

  const email = process.env.ADMIN_EMAIL || "admin@trs.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, name: "Admin", role: "admin" },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin user created:", user.email);

  // Seed default pages
  const pages = [
    { slug: "home", title: "Home", heroTitle: "We Build Digital Experiences", heroSubtitle: "TRS — Where Innovation Meets Design", published: true, order: 0 },
    { slug: "about", title: "About Us", heroTitle: "Our Story", heroSubtitle: "Passionate about delivering exceptional digital solutions", published: true, order: 1 },
    { slug: "services", title: "Services", heroTitle: "What We Do", heroSubtitle: "Comprehensive digital solutions for your business", published: true, order: 2 },
    { slug: "portfolio", title: "Portfolio", heroTitle: "Our Work", heroSubtitle: "Showcasing our best projects and achievements", published: true, order: 3 },
    { slug: "team", title: "Team", heroTitle: "Meet Our Team", heroSubtitle: "The talented people behind TRS", published: true, order: 4 },
    { slug: "blog", title: "Blog", heroTitle: "Insights & News", heroSubtitle: "Thoughts on technology, design, and business", published: true, order: 5 },
    { slug: "contact", title: "Contact", heroTitle: "Get In Touch", heroSubtitle: "Let's start a conversation", published: true, order: 6 },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log("Pages seeded");

  // Seed services
  const services = [
    {
      slug: "web-development",
      title: "Web Development",
      description: "Custom web applications built with cutting-edge technologies. From responsive websites to complex web platforms, we deliver solutions that perform.",
      icon: "Code",
      features: ["Custom Web Applications", "Progressive Web Apps", "E-commerce Solutions", "API Development"],
      order: 0,
    },
    {
      slug: "ui-ux-design",
      title: "UI/UX Design",
      description: "Beautiful, intuitive designs that put users first. We create interfaces that are both stunning and functional.",
      icon: "Palette",
      features: ["User Research", "Wireframing & Prototyping", "Visual Design", "Design Systems"],
      order: 1,
    },
    {
      slug: "mobile-development",
      title: "Mobile Development",
      description: "Native and cross-platform mobile applications that deliver seamless experiences across all devices.",
      icon: "Smartphone",
      features: ["iOS & Android Apps", "React Native", "Flutter", "App Store Optimization"],
      order: 2,
    },
    {
      slug: "cloud-solutions",
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and DevOps solutions that keep your applications running smoothly.",
      icon: "Cloud",
      features: ["AWS & Azure", "CI/CD Pipelines", "Microservices", "Auto-scaling"],
      order: 3,
    },
    {
      slug: "digital-marketing",
      title: "Digital Marketing",
      description: "Data-driven marketing strategies that increase visibility, engagement, and conversions.",
      icon: "TrendingUp",
      features: ["SEO Optimization", "Content Strategy", "Social Media", "Analytics & Reporting"],
      order: 4,
    },
    {
      slug: "consulting",
      title: "Tech Consulting",
      description: "Expert guidance on technology strategy, architecture decisions, and digital transformation.",
      icon: "Lightbulb",
      features: ["Technology Strategy", "Architecture Review", "Digital Transformation", "Team Training"],
      order: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }
  console.log("Services seeded");

  // Seed testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "TechVentures Inc.",
      content: "TRS transformed our digital presence completely. Their team delivered a stunning website that increased our conversions by 40%. Highly recommended!",
      rating: 5,
      featured: true,
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "DataFlow Systems",
      content: "Working with TRS was an absolute pleasure. They understood our complex requirements and delivered a robust platform ahead of schedule.",
      rating: 5,
      featured: true,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "GreenLeaf Brands",
      content: "The UI/UX design TRS created for our app was phenomenal. Our users love the intuitive interface and engagement metrics have skyrocketed.",
      rating: 5,
      featured: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log("Testimonials seeded");

  // Seed team members
  const team = [
    {
      name: "Alex Thompson",
      role: "Founder & CEO",
      bio: "Visionary leader with 15+ years in tech. Passionate about building innovative digital solutions that transform businesses.",
      order: 0,
    },
    {
      name: "Maya Patel",
      role: "Creative Director",
      bio: "Award-winning designer with an eye for clean, impactful design. Leads our creative team with passion and precision.",
      order: 1,
    },
    {
      name: "James Wilson",
      role: "Lead Developer",
      bio: "Full-stack expert specializing in scalable architectures. Turns complex problems into elegant, efficient solutions.",
      order: 2,
    },
    {
      name: "Lisa Chang",
      role: "Project Manager",
      bio: "Keeps everything running smoothly. Expert in agile methodologies with a talent for bringing teams together.",
      order: 3,
    },
  ];

  for (const member of team) {
    await prisma.teamMember.create({ data: member });
  }
  console.log("Team members seeded");

  // Seed portfolio items
  const portfolio = [
    {
      title: "FinTrack Dashboard",
      slug: "fintrack-dashboard",
      description: "A comprehensive financial analytics dashboard for real-time portfolio tracking and market analysis.",
      client: "FinTrack Corp",
      category: "Web Application",
      technologies: ["Next.js", "TypeScript", "D3.js", "PostgreSQL"],
      featured: true,
    },
    {
      title: "EcoShop Marketplace",
      slug: "ecoshop-marketplace",
      description: "Sustainable e-commerce platform connecting eco-conscious consumers with green businesses worldwide.",
      client: "EcoShop Inc",
      category: "E-commerce",
      technologies: ["React", "Node.js", "Stripe", "MongoDB"],
      featured: true,
    },
    {
      title: "HealthPulse Mobile App",
      slug: "healthpulse-app",
      description: "Health and wellness tracking app with AI-powered insights and personalized recommendations.",
      client: "HealthPulse",
      category: "Mobile App",
      technologies: ["React Native", "Python", "TensorFlow", "Firebase"],
      featured: true,
    },
  ];

  for (const item of portfolio) {
    await prisma.portfolioItem.create({ data: item });
  }
  console.log("Portfolio items seeded");

  // Seed blog posts
  const posts = [
    {
      title: "The Future of Web Development in 2026",
      slug: "future-web-development-2026",
      excerpt: "Exploring the latest trends and technologies shaping the web development landscape.",
      content: "# The Future of Web Development\n\nThe web development landscape continues to evolve rapidly.\n\n## AI-Powered Development\n\nArtificial intelligence is transforming how we write code.\n\n## Edge Computing\n\nMoving computation closer to users through edge functions.\n\n## Conclusion\n\nThe future is exciting.",
      category: "Technology",
      tags: ["Web Development", "AI", "Trends"],
      authorName: "Alex Thompson",
      published: true,
      featured: true,
      publishedAt: new Date(),
    },
    {
      title: "Design Systems: Building for Scale",
      slug: "design-systems-building-scale",
      excerpt: "How to create and maintain a design system that scales with your organization.",
      content: "# Design Systems: Building for Scale\n\nA well-crafted design system is the foundation of consistent product development.\n\n## Start with Principles\n\nDefine core principles that guide your design decisions.\n\n## Component Architecture\n\nBuild components that are composable and accessible.",
      category: "Design",
      tags: ["Design Systems", "UI/UX", "Best Practices"],
      authorName: "Maya Patel",
      published: true,
      featured: false,
      publishedAt: new Date(),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.create({ data: post });
  }
  console.log("Blog posts seeded");

  // Seed site settings
  const settings = [
    { key: "siteName", value: "TRS" },
    { key: "siteDescription", value: "Modern digital agency delivering exceptional web experiences" },
    { key: "siteUrl", value: "https://trs.com" },
    { key: "contactEmail", value: "hello@trs.com" },
    { key: "contactPhone", value: "+1 (555) 123-4567" },
    { key: "address", value: "123 Innovation Drive, Tech City, TC 12345" },
    { key: "socialTwitter", value: "https://twitter.com/trs" },
    { key: "socialLinkedin", value: "https://linkedin.com/company/trs" },
    { key: "socialGithub", value: "https://github.com/trs" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("Site settings seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
