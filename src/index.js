'use strict'
fastly.enableDebugLogging(true);

const templates = require("./templates.js");
const Handlebars = require("handlebars");

const blog = require("./blog.js");
const settings = require("./settings.js");
const id = settings.id;

addEventListener('fetch', event => event.respondWith(handleRequest(event)));

async function handleRequest(event) {

    // Send logs to your custom logging endpoint
    // https://developer.fastly.com/learning/compute/javascript/#logging
    // const logger = fastly.getLogger("my-logging-endpoint-name");
    // logger.log("log message");

    // Get the client request from the event
    let req = event.request;

    // Make any desired changes to the client request.
    //   req.headers.set("Host", "example.com");

    // We can filter requests that have unexpected methods.
    const VALID_METHODS = ["GET"];
    if (!VALID_METHODS.includes(req.method)) {
        let response = new Response("This method is not allowed", {
            status: 405
        });

        // Send the response back to the client.
        return response;
    }

    let method = req.method;
    let url = new URL(event.request.url);

    // Get the main blog
    if (method == "GET" && url.pathname == "/") {
        console.log("GET /");

        const seo = await blog.getSEO(id);
        const css = await blog.getCSS(id);
        const posts = await blog.getAllPosts(id, url.host);

        let body = templates.blog({
            url: `https://${url.host}`,
            seo: seo,
            css: css,
            posts: posts
        });

        // console.log(body);

        let headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        let response = new Response(body, {
            status: 200,
            headers
        });

        // Send the response back to the client.
        return response;
    }

    // Get the rss feed
    if (method == "GET" && url.pathname == "/rss") {
        console.log("GET /rss");

        const seo = await blog.getSEO(id);
        const posts = await blog.getAllPosts(id, url.host);

        let body = templates.rss({
            url: `https://${url.host}`,
            seo: seo,
            posts: posts
        });

        // console.log(body);

        let headers = new Headers();
        headers.set('Content-Type', 'application/xml');
        let response = new Response(body, {
            status: 200,
            headers
        });

        // Send the response back to the client.
        return response;
    }

    // Get a post
    if (method == "GET" && url.pathname.startsWith("/posts")) {
        console.log("GET /posts");

        let path = url.pathname.split("/");
        let slug = path[path.length - 1];
        // console.log(slug);

        const post = await blog.getSinglePost(id, url.host, slug);

        if (!post) {
            //TODO return a 302 to /
            let response = new Response("The page you requested could not be found", {
                status: 404
            });

            // Send the response back to the client.
            return response;
        }

        const seo = await blog.getSEO(id);
        const css = await blog.getCSS(id);

        let body = templates.post({
            url: `https://${url.host}`,
            seo: seo,
            css: css,
            post: post
        });

        console.log(body);

        let headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        let response = new Response(body, {
            status: 200,
            headers
        });

        // Send the response back to the client.
        return response;
    }

    // Catch all other requests and return a 404.
    let response = new Response("The page you requested could not be found", {
        status: 404
    });

    // Send the response back to the client.
    return response;
};
