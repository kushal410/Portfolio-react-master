import React, { useState } from "react";

// Project data
const projects = [
  {
    title: "Login Validation",
    imgSrc: "Login.png",
    link: "https://github.com/kushal410",
    tags: ["nodejs", "modular", "typescript"],
    category: "website",
    description: "A simple login validation project using Node.js and Modular architecture.",
    details: "This project allows users to test login functionality with input validation on the server-side using Node.js.",
  },
  {
    title: "Amazon clone",
    imgSrc: "Amazon clone.png",
    link: "https://hungry-shockley-0bea14.netlify.app/",
    tags: ["React", "frontend", "Website"],
    category: "website",
    description: "A fully functional Amazon clone built with React.",
    details: "This project mimics the UI and UX of Amazon's website, allowing users to browse products and add them to a shopping cart.",
  },
  {
    title: "Expensetracker",
    imgSrc: "Expensetracker.png",
    link: "https://expense-tracker-29e8jeyz4-kushalniraulaprojects.vercel.app/",
    tags: ["NEXTjs / Typescript", "Nodejs", "WebApp"],
    category: "webapp",
    description: "An expense tracking web application built using Next.js and Node.js.",
    details: "Track your expenses, set budgets, and review spending patterns with this easy-to-use web app.",
  },
  {
    title: "TicTacToe Game",
    imgSrc: "Tictactoe.png",
    link: "https://tic.kushaln.com.np/",
    tags: ["HTML&CSS", "JavaScript", "Game"],
    category: "game",
    description: "A simple Tic-Tac-Toe game built with HTML, CSS, and JavaScript.",
    details: "Play Tic-Tac-Toe against the computer or another player with this fun game built using vanilla JavaScript.",
  },
  {
    title: "GPA checker",
    imgSrc: "Gpa-checker.png",
    link: "https://kushaln.github.io/GPA-checker/",
    tags: ["HTML&CSS", "JavaScript", "App"],
    category: "website",
    description: "A GPA checker tool built with HTML, CSS, and JavaScript.",
    details: "Calculate your GPA based on the grades and credits entered in this GPA checker app.",
  },
  {
    title: "To do list",
    imgSrc: "mytodolist.png",
    link: "https://github.com/kushal410/TODO",
    tags: ["HTML&CSS", "JavaScript", "Web App"],
    category: "webapp",
    description: "A simple to-do list web app built using HTML, CSS, and JavaScript.",
    details: "Add, edit, and delete tasks with this simple to-do list app. It's a perfect project for beginners in JavaScript.",
  },
];

// Portfolio component
const Portofolio = () => {
  const [filter, setFilter] = useState("all");

  const handleFilterClick = (category) => {
    setFilter(category);
  };

  // Filter projects based on category
  const filteredProjects =
    filter === "all" ? projects : projects.filter((project) => project.category === filter);

  return (
    <section id="Portofolio" className="portofolio">
      <div className="heading text-center pt-5">
        <small>Creative Work</small>
        <h3>Check My Portfolio</h3>
      </div>

      <div id="myBtnContainer" className="text-center mt-4">
        {["all", "game", "webapp", "website", "brand"].map((category) => (
          <button
            key={category}
            className="filter-item"
            onClick={() => handleFilterClick(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="portofolio-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ProjectCard component
const ProjectCard = ({ project }) => {
  return (
    <div
      className={`relative group post col-md-4 ${project.category} all col-10 mt-3 mt-md-0`}
      data-aos="fade-up" id="Portofolio"
    >
      <div className="absolute inset-0 bg-[#2a3b50] group-hover:bg-[#192039] rounded-xl transition-colors duration-300 -z-50"></div>
      <div className="card bg-[#192039] rounded-lg shadow-lg overflow-hidden">
        <a href={project.link}>
          <img
            src={project.imgSrc}
            className="card-img-top w-full h-64 object-cover rounded-md p-2" // Adjusted padding here
            alt={project.title}
          />
        </a>
        <div className="card-body text-center p-4 text-gray-300">
          <h4 className="card-title font-bold text-white">{project.title}</h4>
          <p className="text-sm mb-4">{project.description}</p>
          {project.tags.map((tag, index) => (
            <span key={index} className="badge bg-secondary badge-pill mr-2">
              {tag}
            </span>
          ))}
          <div className="flex justify-between mt-4">
            <a
              href={project.link}
              className="text-blue-500 font-bold hover:text-blue-700"
            >
              Live Demo
            </a>
            <div className="text-gray-100 font-bold" style={{ color: "#3a4c68" }}>
              Details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portofolio;
