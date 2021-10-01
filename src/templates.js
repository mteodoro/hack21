const Handlebars = require("handlebars");

const blog = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
  <head>
    
    <meta charset="utf-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>{{seo.title}}</title>
    
    <!-- Meta tags for SEO and social sharing -->
    <link rel="canonical" href="{{seo.url}}">
    <meta name="description" content="{{seo.description}}">
    <meta property="og:title" content="{{seo.title}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{{seo.url}}">
    <meta property="og:description" content="{{seo.description}}">
    <meta property="og:image" content="{{seo.image}}">
    <meta name="twitter:card" content="summary">

    <style type="text/css">
      {{{css}}}
    </style>
  </head>
  <body>
    
    <header>
      <a href="{{url}}">
        <h1>
          {{seo.title}}
        </h1>
      </a>
      <p>
        {{{seo.html}}}
      </p>
    </header>
    
    <main>
      {{#if posts}}
        {{#each posts}}
          <article>
             <a href="
              {{#if this.source}}
                {{this.source}}
              {{else}}
               {{this.url}}
              {{/if}}
              "><h2>{{this.title}}</h2></a>
            <time>
              {{this.prettyDate}}
            </time>
            <span class="meta">
              {{#if this.author}}
                &nbsp;by {{this.author}}
              {{/if}}
              {{#if this.tags}}
                 <br/><b>tags:</b> {{this.tags}}
              {{/if}}
            </span>
            {{{this.html}}}
          </article>
        {{/each}}
      {{else}}
        No posts yet!
      {{/if}}
    </main>
    
    <footer>
      <p>
        <a href="{{url}}">{{seo.title}}</a> is powered by <a href="https://www.fastly.com/products/edge-compute/serverless">Fastly Compute@Edge</a><br/>
        <a href="{{url}}">Home</a> | <a href="{{url}}/rss">RSS</a>
      </p>
    </footer>
    
  </body>
</html>
`.trim());

const post = Handlebars.compile(`
<!DOCTYPE html>
<html lang="en">
  <head>
    
    <meta charset="utf-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍕</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>{{seo.title}} - {{post.title}}</title>
    
    <!-- Meta tags for SEO and social sharing -->
    <link rel="canonical" href="{{post.url}}">
    <meta name="description" content="{{post.markdown}}">
    <meta property="og:title" content="{{post.title}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{{post.url}}">
    <meta property="og:description" content="{{post.markdown}}">
    <meta property="og:image" content="{{post.image}}">
    <meta name="twitter:card" content="summary">

    <style type="text/css">
      {{{css}}}
    </style>
  </head>
  <body>
    
    <header>
      <a href="{{url}}">
        <h1>
          {{seo.title}}
        </h1>
      </a>
      <p>
        {{{seo.html}}}
      </p>
    </header>
    
    <main>
      <article>
        <a href="
          {{#if post.source}}
            {{post.source}}
          {{else}}
            {{post.url}}
          {{/if}}
          ">
        <h2>
          {{post.title}}
        </h2>
        </a>
        <time>
          {{post.prettyDate}}
        </time>
        <span class="meta">
          {{#if post.author}}
            by {{post.author}}
          {{/if}}
          {{#if post.tags}}
             <br/><b>tags:</b> {{post.tags}}
          {{/if}}
        </span>
        {{{post.html}}}
      </article>
    </main>
    
    <footer>
      <p>
        <a href="{{url}}">{{seo.title}}</a> is powered by <a href="https://www.fastly.com/products/edge-compute/serverless">Fastly Compute@Edge</a><br/>
        <a href="{{url}}">Home</a> | <a href="{{url}}/rss">RSS</a>
      </p>
    </footer>
    
  </body>
</html>
`.trim());

const rss = Handlebars.compile(`
<!DOCTYPE xml>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{{seo.title}}</title>
    <link>{{url}}/rss</link>
    <atom:link href="{{url}}/rss" rel="self" type="application/rss+xml" />
    <description>{{seo.description}}</description>
    {{#each posts}}
      <item>
        <guid>
          {{this.url}}
        </guid>
        <title>
          {{this.title}}
        </title>
        <pubDate>
          {{this.utcDate}}
        </pubDate>
        <description>
          <![CDATA[{{{this.html}}}]]>
        </description>
      </item>
    {{/each}}
  </channel>
</rss>
`.trim());

module.exports = {
    blog,
    post,
    rss,
};
