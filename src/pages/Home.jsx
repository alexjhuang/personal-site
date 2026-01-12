import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import { blogs } from "../lib/blogs.js";

const heroText = "Software Engineer with an interest in ML Systems";
const heroWords = heroText.split(" ");

const experiences = [
  {
    company: "Annapurna Labs (AWS)",
    title: "Compiler Engineer Intern — Neuron Kernel Interface",
    dates: "Oct 2025 — Jan 2026",
    logo: "image",
    src: "/artifacts/annapurna-labs-squarelogo-1582700117666.jpg",
    bullets: [
      "Founding contributor to the NKI compiler backend — a Triton-like kernel DSL for Trainium/Inferentia.",
      "Optimized MatMul and FlashAttention kernels with DMA prefetching and software pipelining.",
      "Tuned tile sizes and buffering to reach >85% HFU utilization across 1K–8K shapes.",
      "Designed compiler passes for loop scheduling and allocation in MLIR/NISA dialects.",
    ],
  },
  {
    company: "Tesla — Inference Hardware",
    title: "Autopilot Engineer Intern",
    dates: "Aug 2025 — Oct 2025",
    logo: "image",
    src: "/artifacts/tesla-logo-tesla-icon-transparent-png-free-vector.jpg",
    bullets: [
      "Enabled AI5 chip for large-scale distributed training and inference.",
      "Evaluated multi-SoC interconnect topologies for MAC-heavy GEMM/conv workloads.",
      "Prototyped agentic-AI–assisted RTL for interconnect adapters and MAC-side FIFOs.",
    ],
  },
  {
    company: "Amazon Web Services — ML Accelerator",
    title: "Software Development Engineer Intern — ML Systems",
    dates: "May 2025 — Aug 2025",
    logo: "image",
    src: "/artifacts/awslogo.jpg",
    bullets: [
      "Engineered a node targeting algorithm for Kubernetes with pre-launch diagnostics.",
      "Maintained orchestration for 1,200+ training/inference workloads per hour.",
      "Implemented resource sharing and priority queuing to boost utilization >95%.",
    ],
  },
  {
    company: "Amazon Web Services — Elastic Container Service",
    title: "Software Development Engineer Intern",
    dates: "May 2024 — Aug 2024",
    logo: "image",
    src: "/artifacts/awslogo.jpg",
    bullets: [
      "Built backend infrastructure for functional testing and resource provisioning.",
      "Integrated a continuous testing suite for ECS agent releases.",
      "Automated AMI release notifications to 150,000+ subscribers.",
    ],
  },
  {
    company: "University of Virginia",
    title: "Undergraduate Machine Learning Researcher",
    dates: "Sep 2022 — Jul 2023",
    logo: "image",
    src: "/artifacts/UVA-Logo.svg",
    bullets: [
      "Authored “PyGDebias: A Python Library for Debiasing in Graph Learning” (WWW'24).",
      "Ran hyper-parameter tuning via grid and random search.",
      "Built metrics for six+ graph neural networks and analyzed large datasets.",
    ],
  },
];

const educationItems = [
  {
    school: "University of Virginia",
    title: "B.S. Computer Science & Mathematics",
    dates: "Aug 2022 - May 2026",
    logo: "image",
    src: "/artifacts/UVA-Logo.svg",
    csCourses: [
      { name: "Learning in Robotics", code: "CS 6501" },
      { name: "Compilers", code: "CS 4620" },
      { name: "Computer Vision", code: "CS 4501" },
      { name: "Reinforcement Learning", code: "CS 4501" },
      { name: "Natural Language Processing", code: "CS 4501" },
      { name: "Computer Networks", code: "CS 4457" },
      { name: "Advanced Computer Architecture", code: "CS 4330" },
      { name: "Introduction to Cybersecurity", code: "CS 3710" },
      { name: "Software Development Essentials", code: "CS 3140" },
      { name: "Computer Systems and Organization 2", code: "CS 3130" },
      { name: "Discrete Math and Theory 2", code: "CS 3120" },
      { name: "Data Structures and Algorithms 2", code: "CS 3100" },
      { name: "Computer Systems and Organization 1", code: "CS 2130" },
      { name: "Discrete Math and Theory 1", code: "CS 2120" },
      { name: "Introduction to Programming", code: "CS 1110" },
    ],
    mathCourses: [
      { name: "Advanced Linear Algebra", code: "MATH 4651" },
      { name: "Calculus on Manifolds", code: "MATH 4330" },
      { name: "Survey of Algebra", code: "MATH 3354" },
      { name: "Elementary Linear Algebra", code: "MATH 3351" },
      { name: "Complex Variables", code: "MATH 3340" },
      { name: "Basic Real Analysis", code: "MATH 3310" },
      { name: "Ordinary Differential Equations", code: "MATH 3250" },
      { name: "Introduction to Probability", code: "MATH 3100" },
      { name: "Calculus III", code: "MATH 2310" },
      { name: "Calculus II", code: "MATH 1320" },
      { name: "Calculus I", code: "MATH 1310" },
    ],
  },
  {
    school: "Thomas Jefferson High School for Science and Technology",
    title: "STEM Focus",
    dates: "Aug 2018 — May 2022",
    logo: "image",
    src: "/artifacts/TJlogo.jpg",
    courses: ["Course list coming soon."],
  },
];

const spotifyWave = [
  { label: "Mon", energy: 0.35 },
  { label: "Tue", energy: 0.45 },
  { label: "Wed", energy: 0.6 },
  { label: "Thu", energy: 0.8 },
  { label: "Fri", energy: 0.9 },
  { label: "Sat", energy: 0.7 },
  { label: "Sun", energy: 0.5 },
];

const topTracks = [
  "After Dark",
  "Nights Like This",
  "Instant Crush",
  "Midnight City",
  "Digital Love",
];

const topArtists = ["Daft Punk", "The Weeknd", "Kali Uchis", "M83", "ODESZA"];

function Home() {
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [showMoreBlogs, setShowMoreBlogs] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [metrics, setMetrics] = useState({ views: {} });
  const [spotifyActive, setSpotifyActive] = useState(true);
  const [showSpotifyOverlay, setShowSpotifyOverlay] = useState(true);

  useEffect(() => {
    let frame = 0;
    const handleMove = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        setGlow({ x, y });
        frame = 0;
      });
    };

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    fetch("/blog-metrics.json")
      .then((response) => response.json())
      .then((data) => setMetrics(data))
      .catch(() => setMetrics({ views: {} }));
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const spotifySection = document.getElementById("spotify");
    if (!spotifySection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setSpotifyActive(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(spotifySection);
    return () => observer.disconnect();
  }, []);

  const blogsWithViews = useMemo(
    () =>
      blogs.map((blog) => ({
        ...blog,
        views: metrics.views?.[blog.slug] ?? 0,
      })),
    [metrics]
  );

  const featuredBlogs = useMemo(() => {
    const sorted = [...blogsWithViews].sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      return new Date(b.date) - new Date(a.date);
    });
    return sorted.slice(0, 3);
  }, [blogsWithViews]);

  const remainingBlogs = useMemo(() => {
    const featuredSlugs = new Set(featuredBlogs.map((blog) => blog.slug));
    return blogsWithViews.filter((blog) => !featuredSlugs.has(blog.slug));
  }, [blogsWithViews, featuredBlogs]);

  const blogTags = useMemo(() => {
    return [
      "All",
      ...new Set(remainingBlogs.flatMap((blog) => blog.tags ?? [])),
    ];
  }, [remainingBlogs]);

  const filteredMoreBlogs = useMemo(() => {
    return remainingBlogs
      .filter((blog) => activeTag === "All" || blog.tags?.includes(activeTag))
      .sort((a, b) => {
        if (sortOrder === "latest") {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortOrder === "oldest") {
          return new Date(a.date) - new Date(b.date);
        }
        return 0;
      });
  }, [remainingBlogs, activeTag, sortOrder]);

  return (
    <div className="min-h-screen bg-ink text-fog">
      <section className="hero-mesh relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mesh-bg mesh-bg--far" />
        <div className="pointer-events-none absolute inset-0 mesh-bg" />
        <div className="pointer-events-none absolute inset-0 mesh-light" />
        <div
          className="pointer-events-none absolute inset-0 mesh-highlight"
          style={{
            "--glow-x": `${glow.x}%`,
            "--glow-y": `${glow.y}%`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-halo opacity-30" />
        <div className="pointer-events-none absolute -right-32 top-12 h-72 w-72 rounded-full bg-ember/10 blur-[120px] motion-safe:animate-pulseSlow" />

        <SiteHeader />

        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-5xl items-center justify-center px-8 text-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-fog/60 motion-safe:animate-rise">
              Alex Huang
            </p>
            <h1
              className="font-display text-5xl font-semibold leading-tight text-fog motion-safe:animate-rise md:text-7xl"
              style={{ animationDelay: "120ms" }}
            >
              {heroWords.map((word, index) => (
                <span className="hero-word" key={`${word}-${index}`}>
                  {word}
                  {index < heroWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p
              className="text-base uppercase tracking-[0.32em] text-fog/60 motion-safe:animate-rise"
              style={{ animationDelay: "220ms" }}
            >
              Clusters · Kernels · Backend Infra
            </p>
          </div>
        </main>
      </section>

      <section
        id="about"
        className="mx-auto w-full max-w-6xl px-8 pb-32 pt-16 text-left reveal"
        data-reveal
      >
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="space-y-5">
            <p className="section-header text-fog/60">About Me</p>
            <div className="space-y-4 text-lg text-fog/70">
              <p>
                I enjoy building highly performant and scalable systems
                particularly for ML workloads. I've had the privilege of working with some of the brightest and most talented people in the space on everything from <br /> Kubernetes &rarr; Compilers &rarr; Kernels.
              </p>
              <p>
                I like scrappy environments where teams move fast and iterate
                through organized chaos.
              </p>
            </div>
            <div className="space-y-3 text-sm uppercase tracking-[0.32em] text-fog/60">
              <p>Hobbies</p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-fog/60">
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Climbing
                </span>
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Basketball
                </span>
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Tennis
                </span>
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Reading
                </span>
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Traveling
                </span>
                <span className="rounded-full border border-fog/15 px-4 py-2">
                  Food
                </span>
              </div>
            </div>
            <div className="space-y-3 pt-3">
              <p className="text-sm text-fog/70">
                If you're interested in working together, feel free to reach
                out!
              </p>
              <div className="flex items-center gap-4 text-fog/70">
                <a
                  className="transition hover:text-ember"
                  href="https://linkedin.com/in/alexjhuang"
                  aria-label="LinkedIn"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 8.98h3.96V21H3V8.98zM9.5 8.98H13v1.64h.05c.49-.92 1.7-1.89 3.5-1.89 3.75 0 4.45 2.47 4.45 5.68V21H17v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9.5V8.98z" />
                  </svg>
                </a>
                <a
                  className="transition hover:text-ember"
                  href="mailto:alexjinghuang@gmail.com"
                  aria-label="Email"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-[32px] border border-fog/15 bg-fog/5">
              <img
                src="/artifacts/IMG_1273.jpeg"
                alt="Alex Huang portrait"
                className="h-full w-full object-cover object-[center_0%]"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-fog/40">
              Versailles, FRA
            </p>
          </div>
        </div>
      </section>

      <section
        id="experience"
        className="mx-auto w-full max-w-6xl px-8 pb-32 text-left reveal"
        data-reveal
      >
        <div className="space-y-8">
          <p className="section-header text-fog/60">Experience</p>
          <div className="space-y-7">
            {experiences.map((experience) => (
              <div className="experience-row" key={experience.title}>
                <div className="experience-icon">
                  {experience.logo === "image" ? (
                    <img
                      src={experience.src}
                      alt={`${experience.company} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span>{experience.initials}</span>
                  )}
                </div>
                <div className="experience-card">
                  <div className="experience-header">
                    <div>
                      <p className="experience-title">{experience.title}</p>
                      <p className="experience-company">{experience.company}</p>
                    </div>
                    <span className="experience-plus">+</span>
                  </div>
                  <div className="experience-details">
                    <ul>
                      {experience.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <span className="experience-date">{experience.dates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="education"
        className="mx-auto w-full max-w-6xl px-8 pb-32 text-left reveal"
        data-reveal
      >
        <div className="space-y-8">
          <p className="section-header text-fog/60">Education</p>
          <div className="space-y-7">
            {educationItems.map((item) => (
              <div className="experience-row" key={item.school}>
                <div className="experience-card education-card">
                  <div className="education-logo">
                    {item.logo === "image" ? (
                      <img
                        src={item.src}
                        alt={`${item.school} logo`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span>{item.initials}</span>
                    )}
                  </div>
                  <div className="education-content">
                    <div className="experience-header">
                      <div>
                        <p className="experience-title">{item.school}</p>
                        <p className="experience-company">{item.title}</p>
                      </div>
                      <span className="experience-plus">+</span>
                    </div>
                    <div className="experience-details">
                      {item.csCourses && item.mathCourses ? (
                        <div className="edu-columns">
                          <div>
                            <p className="edu-heading">Computer Science</p>
                            <ul>
                              {item.csCourses.map((course) => (
                                <li key={`${course.name}-${course.code}`}>
                                  <span className="edu-course-name">
                                    {course.name}
                                  </span>
                                  <span className="edu-course-code">
                                    {course.code}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="edu-heading">Mathematics</p>
                            <ul>
                              {item.mathCourses.map((course) => (
                                <li key={`${course.name}-${course.code}`}>
                                  <span className="edu-course-name">
                                    {course.name}
                                  </span>
                                  <span className="edu-course-code">
                                    {course.code}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <ul>
                          {item.courses.map((course) => (
                            <li key={course}>{course}</li>
                          ))}
                        </ul>
                      )}
                      <span className="experience-date">{item.dates}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="blogs"
        className="mx-auto w-full max-w-6xl px-8 pb-32 text-left reveal"
        data-reveal
      >
        <div className="space-y-6">
          <p className="section-header text-fog/60">Blogs</p>
          {blogsWithViews.length === 0 ? (
            <p className="text-lg text-fog/60">Coming soon.</p>
          ) : (
            <>
              <div className="space-y-5">
                {featuredBlogs.map((blog) => (
                  <Link
                    key={blog.slug}
                    className="blog-banner"
                    style={{ backgroundImage: `url(${blog.cover})` }}
                    to={`/blog/${blog.slug}`}
                  >
                    <div className="blog-overlay" />
                    <div className="blog-content">
                      <h3>{blog.title}</h3>
                      <div className="blog-tags">
                        {blog.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <span className="blog-fire" aria-hidden="true">
                      🔥
                    </span>
                  </Link>
                ))}
              </div>
              {remainingBlogs.length > 0 && (
                <>
                  <button
                    className="blog-toggle"
                    type="button"
                    onClick={() => setShowMoreBlogs((prev) => !prev)}
                  >
                    {showMoreBlogs ? "Show less" : "Show more"}
                  </button>
                  {showMoreBlogs && (
                    <div className="space-y-6">
                      <div className="blog-controls">
                        <div className="blog-filters">
                          {blogTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              className={`blog-filter ${
                                activeTag === tag ? "is-active" : ""
                              }`}
                              onClick={() => setActiveTag(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="blog-sort">
                          <label htmlFor="blog-sort">Sort</label>
                          <select
                            id="blog-sort"
                            value={sortOrder}
                            onChange={(event) =>
                              setSortOrder(event.target.value)
                            }
                          >
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-5">
                        {filteredMoreBlogs.map((blog) => (
                          <Link
                            key={blog.slug}
                            className="blog-banner blog-banner--alt"
                            style={{ backgroundImage: `url(${blog.cover})` }}
                            to={`/blog/${blog.slug}`}
                          >
                            <div className="blog-overlay" />
                            <div className="blog-content">
                              <h3>{blog.title}</h3>
                              <div className="blog-tags">
                                {blog.tags.map((tag) => (
                                  <span key={tag}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section
        id="spotify"
        className="mx-auto w-full max-w-6xl px-8 pb-36 text-left reveal"
        data-reveal
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="spotify-dot" />
            <p className="section-header text-fog/60">Spotify</p>
          </div>
          <div className={`spotify-card ${spotifyActive ? "" : "is-paused"}`}>
            {showSpotifyOverlay && (
              <div className="spotify-overlay">
                <p>Spotify integrations are temporarily on hold.</p>
                <span>Back soon.</span>
                <button
                  className="spotify-dismiss"
                  type="button"
                  onClick={() => setShowSpotifyOverlay(false)}
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="spotify-meta">
              <div>
                <p className="spotify-label">Listening today</p>
                <p className="spotify-value">3h 42m</p>
              </div>
              <div className="spotify-tags">
                <span>Top tracks</span>
                <span>Top artists</span>
              </div>
            </div>
            <div className="spotify-wave">
              {spotifyWave.map((day, index) => (
                <div className="spotify-bar" key={day.label}>
                  <div
                    className="spotify-bar-inner"
                    style={{
                      "--bar-height": `${24 + day.energy * 90}px`,
                      "--bar-delay": `${index * 120}ms`,
                    }}
                  />
                  <span>{day.label}</span>
                </div>
              ))}
            </div>
            <div className="spotify-lists">
              <div>
                <p>Top tracks (last 90 days)</p>
                <ul>
                  {topTracks.map((track) => (
                    <li key={track}>{track}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p>Top artists (last 90 days)</p>
                <ul>
                  {topArtists.map((artist) => (
                    <li key={artist}>{artist}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="spotify-note">
              Updates nightly with the latest listening stats.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
