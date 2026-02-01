import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  copyFileSync,
} from "fs";
import { join, basename } from "path";
import { marked } from "marked";
import fm from "front-matter";

interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

const POSTS_DIR = "posts";
const BLOG_DIR = "blog";
const TEMPLATE_PATH = "src/blog-template.html";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readPosts(): Post[] {
  if (!existsSync(POSTS_DIR)) {
    console.log(`No ${POSTS_DIR} directory found, skipping blog build.`);
    return [];
  }

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts: Post[] = [];

  for (const file of files) {
    const content = readFileSync(join(POSTS_DIR, file), "utf-8");
    const parsed = fm<PostFrontmatter>(content);
    const slug = basename(file, ".md");

    posts.push({
      slug,
      title: parsed.attributes.title,
      date: parsed.attributes.date,
      description: parsed.attributes.description || "",
      content: marked.parse(parsed.body) as string,
    });
  }

  // Sort by date, newest first
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

function buildPost(post: Post, template: string): void {
  const postContent = `
    <article>
      <header>
        <h1>${post.title}</h1>
        <p class="date">${formatDate(post.date)}</p>
      </header>
      <div class="content">
        ${post.content}
      </div>
    </article>
  `;

  const html = template
    .replace("{{TITLE}}", post.title)
    .replace("{{META_DESCRIPTION}}", post.description || post.title)
    .replace("{{BACK_LINK}}", "/blog/")
    .replace("{{BACK_TEXT}}", "Notes")
    .replace("{{CONTENT}}", postContent);

  writeFileSync(join(BLOG_DIR, `${post.slug}.html`), html);
  console.log(`Built: blog/${post.slug}.html`);
}

function copyAssets(): void {
  if (!existsSync(POSTS_DIR)) {
    return;
  }

  const files = readdirSync(POSTS_DIR).filter((f) => !f.endsWith(".md"));

  for (const file of files) {
    copyFileSync(join(POSTS_DIR, file), join(BLOG_DIR, file));
    console.log(`Copied: blog/${file}`);
  }
}

function buildIndex(posts: Post[], template: string): void {
  const postsList = posts
    .map(
      (post) => `
      <li>
        <a href="/blog/${post.slug}.html">${post.title}</a>
        <span class="date">${formatDate(post.date)}</span>
      </li>
    `,
    )
    .join("");

  const indexContent = `
    <h1>Notes</h1>
    <ul class="posts-list">
      ${postsList || "<li>No posts yet.</li>"}
    </ul>
  `;

  const html = template
    .replace("{{TITLE}}", "Notes")
    .replace("{{META_DESCRIPTION}}", "Notes by Maarten Van Steenkiste")
    .replace("{{BACK_LINK}}", "/")
    .replace("{{BACK_TEXT}}", "Home")
    .replace("{{CONTENT}}", indexContent);

  writeFileSync(join(BLOG_DIR, "index.html"), html);
  console.log("Built: blog/index.html");
}

function main(): void {
  // Read template
  const template = readFileSync(TEMPLATE_PATH, "utf-8");

  // Ensure blog directory exists
  if (!existsSync(BLOG_DIR)) {
    mkdirSync(BLOG_DIR, { recursive: true });
  }

  // Read and process posts
  const posts = readPosts();

  // Build individual post pages
  for (const post of posts) {
    buildPost(post, template);
  }

  // Build index page
  buildIndex(posts, template);

  // Copy assets (images, etc.)
  copyAssets();

  console.log(`\nBlog build complete: ${posts.length} post(s)`);
}

main();
