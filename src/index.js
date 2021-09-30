'use strict'
fastly.enableDebugLogging(true);

const blog = require("./blog.js");


addEventListener('fetch', event => event.respondWith(handleRequest(event)));

const GDOCS = "google_docs";
const id = "1UBEnCquJDebp8_3hsrVl6ri6GJjF-sIwcpg5D3pv1Hg";
// const SHEET_URL = "https://docs.google.com/spreadsheets/d/1UBEnCquJDebp8_3hsrVl6ri6GJjF-sIwcpg5D3pv1Hg";

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

  // If request is a `GET` to the `/` path, send a default response.
  if (method == "GET" && url.pathname == "/") {

/*      
console.log('got here');
const AGE = 25;
      console.log(`I'm ${AGE} years old!`);


    const be_url =  `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=Posts`;
    console.log(be_url);

  let resp = await fetch(
    //SHEET_URL + "/gviz/tq?tqx=out:json&sheet=Posts",
       `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=CSS`,
      { backend: GDOCS });

//    console.log(resp.text());
  const text = await resp.text();
    console.log(text)

/*
    let posts = await fetch(
    SHEET_URL + "/gviz/tq?tqx=out:json&sheet=Posts",
        { backend: GDOCS });
*/

    const posts = await blog.getAllPosts(id);
    //const posts = await blog.getSinglePost(id, 'foo+bar+baz+bat');
      console.log('pre posts')
      console.log(JSON.stringify(posts));
      console.log('post posts')


    let headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    let response = new Response(JSON.stringify(posts), {
      status: 200,
      headers
    });

    // Send the response back to the client.
    return response;
  }

  // If request is a `GET` to the `/backend` path, send to a named backend.
  if (method == "GET" && url.pathname == "/backend") {
    // Request handling logic could go here...
    // E.g., send the request to an origin backend and then cache the
    // response for one minute.
    let cacheOverride = new CacheOverride("override", { ttl:60 });
    return fetch(req, {
      backend: BACKEND_NAME,
      cacheOverride,
    });
  }

  // If request is a `GET` to a path starting with `/other/`.
  if (method == "GET" && url.pathname.startsWith("/other/")) {
    // Send request to a different backend and don't cache response.
    let cacheOverride = new CacheOverride("pass");
    return fetch(req, {
      backend: OTHER_BACKEND_NAME,
      cacheOverride,
    });
  }

  // Catch all other requests and return a 404.
  let response = new Response("The page you requested could not be found", {
    status: 404
  });

  // Send the response back to the client.
  return response;
};
