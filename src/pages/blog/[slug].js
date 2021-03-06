import React, { useMemo } from "react";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { useCMS, useLocalForm, useWatchFormValues } from "tinacms";
import { usePlugins, ScreenPlugin } from "tinacms";
const atob = require("atob");
const { createPR, getContent, saveContent } = require("../../github/api");

import Layout from "../../components/Layout";
import toMarkdownString from "../../utils/toMarkdownString";
import { USE_CONTENT_API } from "../../constants";

export class PRPlugin {
  constructor(baseRepoFullName, forkRepoFullName, branch, accessToken) {
    this.__type = "screen";
    this.name = "Create Pull Request";
    this.Icon = () => <>🚀</>;
    this.layout = "popup";
    this.state = {
      responseMessage: ""
    };

    this.createPR = () => {
      createPR(baseRepoFullName, forkRepoFullName, branch, accessToken)
        .then(response => {
          alert(`you made a PR!: ${response.data.html_url}`);
        })
        .catch(err => {
          alert(
            `PR failed (Has a PR already been created?): ${JSON.stringify(err)}`
          );
        });
    };

    this.Component = () => {
      return (
        <div style={{ padding: "10px" }}>
          <a
            target="_blank"
            href={`https://github.com/${baseRepoFullName}/compare/master...${
              forkRepoFullName.split("/")[0]
            }:${branch}`}
          >
            See Changes
          </a>
          <p>
            This will create a PR from:
            <br />
            <b>
              {forkRepoFullName} - {branch}
            </b>{" "}
            <br />
            into <br />
            <b>
              {baseRepoFullName} - {branch}
            </b>
          </p>
          <button onClick={this.createPR}>Create PR</button>

          <div>{this.state.responseMessage}</div>
        </div>
      );
    };
  }
}

export default function BlogTemplate(props) {
  const sha = props.sha;
  // TINA CMS Config ---------------------------
  const cms = useCMS();

  const [post, form] = useLocalForm({
    id: props.fileRelativePath, // needs to be unique
    label: "Edit Post",

    // starting values for the post object
    initialValues: {
      fileRelativePath: props.fileRelativePath,
      frontmatter: props.data,
      markdownBody: props.content,
      sha
    },

    // field definition
    fields: [
      {
        label: "Hero Image",
        name: "frontmatter.hero_image",
        component: "image",
        // Generate the frontmatter value based on the filename
        parse: filename => `../static/${filename}`,

        // Decide the file upload directory for the post
        uploadDir: () => "/src/static/",

        // Generate the src attribute for the preview image.
        previewSrc: data => `/static/${data.frontmatter.hero_image}`
      },
      {
        name: "frontmatter.title",
        label: "Title",
        component: "text"
      },
      {
        name: "frontmatter.date",
        label: "Date",
        component: "date"
      },
      {
        name: "frontmatter.author",
        label: "Author",
        component: "text"
      },
      {
        name: "markdownBody",
        label: "Blog Body",
        component: "markdown"
      }
    ],

    // save & commit the file when the "save" button is pressed
    onSubmit(data, form) {
      if (USE_CONTENT_API) {
        saveContent(
          props.forkFullName,
          props.branch,
          data.fileRelativePath,
          props.access_token,
          data.sha,
          toMarkdownString(data),
          "Update from TinaCMS"
        ).then(response => {
          window.location.reload();
        }); //hack so sha updates
      } else {
        // create commit?
        alert("saves on localhost not supported");
      }
    }
  });

  function usePRPlugin() {
    const brancher = useMemo(() => {
      return new PRPlugin(
        props.baseRepoFullName,
        props.forkFullName,
        props.branch,
        props.access_token
      );
    }, [
      props.baseRepoFullName,
      props.forkFullName,
      props.branch,
      props.access_token
    ]);

    usePlugins(brancher);
  }

  if (USE_CONTENT_API) {
    usePRPlugin();
  }

  // END Tina CMS config -----------------------------

  function reformatDate(fullDate) {
    const date = new Date(fullDate);
    return date.toDateString().slice(4);
  }

  return (
    <Layout siteTitle={props.title}>
      <article className="blog">
        <figure className="blog__hero">
          <img
            src={post.frontmatter.hero_image}
            alt={`blog_hero_${post.frontmatter.title}`}
          />
        </figure>
        <div className="blog__info">
          <h1>{post.frontmatter.title}</h1>
          <h3>{reformatDate(post.frontmatter.date)}</h3>
        </div>
        <div className="blog__body">
          <ReactMarkdown source={post.markdownBody} />
        </div>
        <h2 className="blog__footer">Written By: {post.frontmatter.author}</h2>
      </article>
      <style jsx>
        {`
          .blog h1 {
            margin-bottom: 0.7rem;
          }

          .blog__hero {
            min-height: 300px;
            height: 60vh;
            width: 100%;
            margin: 0;
            overflow: hidden;
          }
          .blog__hero img {
            margin-bottom: 0;
            object-fit: cover;
            min-height: 100%;
            min-width: 100%;
            object-position: center;
          }

          .blog__info {
            padding: 1.5rem 1.25rem;
            width: 100%;
            max-width: 768px;
            margin: 0 auto;
          }
          .blog__info h1 {
            margin-bottom: 0.66rem;
          }
          .blog__info h3 {
            margin-bottom: 0;
          }

          .blog__body {
            width: 100%;
            padding: 0 1.25rem;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .blog__body a {
            padding-bottom: 1.5rem;
          }
          .blog__body:last-child {
            margin-bottom: 0;
          }
          .blog__body h1 h2 h3 h4 h5 h6 p {
            font-weight: normal;
          }
          .blog__body p {
            color: inherit;
          }
          .blog__body ul {
            list-style: initial;
          }
          .blog__body ul ol {
            margin-left: 1.25rem;
            margin-bottom: 1.25rem;
            padding-left: 1.45rem;
          }

          .blog__footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 1.25rem;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
          }
          .blog__footer h2 {
            margin-bottom: 0;
          }
          .blog__footer a {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .blog__footer a svg {
            width: 20px;
          }

          @media (min-width: 768px) {
            .blog {
              display: flex;
              flex-direction: column;
            }
            .blog__body {
              max-width: 800px;
              padding: 0 2rem;
            }
            .blog__body span {
              width: 100%;
              margin: 1.5rem auto;
            }
            .blog__body ul ol {
              margin-left: 1.5rem;
              margin-bottom: 1.5rem;
            }
            .blog__hero {
              min-height: 600px;
              height: 75vh;
            }
            .blog__info {
              text-align: center;
              padding: 2rem 0;
            }
            .blog__info h1 {
              max-width: 500px;
              margin: 0 auto 0.66rem auto;
            }
            .blog__footer {
              padding: 2.25rem;
            }
          }

          @media (min-width: 1440px) {
            .blog__hero {
              height: 70vh;
            }
            .blog__info {
              padding: 3rem 0;
            }
            .blog__footer {
              padding: 2rem 2rem 3rem 2rem;
            }
          }
        `}
      </style>
    </Layout>
  );
}

BlogTemplate.getInitialProps = async function(ctx) {
  const { slug } = ctx.query;
  const config = await import(`../../data/config.json`);

  if (USE_CONTENT_API) {
    const access_token = ctx.req.cookies["tina-github-auth"];
    const forkFullName = ctx.req.cookies["tina-github-fork-name"];

    const branch = ctx.query.branch || "master";
    const post = await getContent(
      forkFullName,
      branch,
      `src/posts/${slug}.md`,
      access_token
    );

    const data = matter(atob(post.data.content));

    return {
      fileRelativePath: `src/posts/${slug}.md`,
      title: config.title,
      branch,
      sha: post.data.sha,
      access_token,
      forkFullName,
      baseRepoFullName: process.env.REPO_FULL_NAME,
      ...data
    };
  } else {
    const content = await import(`../../posts/${slug}.md`);
    const data = matter(content.default);

    return {
      fileRelativePath: `src/posts/${slug}.md`,
      title: config.title,
      ...data
    };
  }
};
