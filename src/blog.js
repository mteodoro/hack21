/* adapted from https://www.sheet-posting.me */

const settings = require("./settings.js");
const GDOCS = settings.GDOCS;

showdown = require("showdown");
converter = new showdown.Converter();

/* ::: Get the contents of the spreadsheet as JSON ::: */
/* ::: Thanks to Tom Critchlow for the inspiration here: https://glitch.com/~foremost-radial-land
        that pointed me towards this Ben Borgers post with more details: https://benborgers.com/posts/google-sheets-json ::: */

const getAllPosts = async (id, host) => {
    console.log('getAllPosts()')
    let cacheOverride = new CacheOverride("pass");
    const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=Posts`, {
            backend: GDOCS,
            cacheOverride,
        });

    const text = await response.text();
    // console.log(text);

    var posts = [];

    /* ::: Cut out extraneous text from the sheet's JSON ::: */
    const json = JSON.parse(text.substr(47).slice(0, -2));

    /* ::: Get the label for each column, defined in row 1 of the spreadsheet
          Interestingly, the first sheet is the only one that has us use the "cols" value to get the labels.
          You'll notice that in the CSS function, we use the first "rows" value instead. ::: */
    const cols = json.table.cols.filter(c => c.label !== '');

    /* ::: Get the rows that contain posts ::: */
    const rows = json.table.rows.filter(r => r);

    /* ::: Loop through the rows ::: */
    for (var i = 0; i < rows.length; i++) {
        /* ::: Google Sheets provides each cell as an object, with the actual text in the "v" key (v for value maybe?) ::: */
        /* ::: So first we grab the content (c) of the row we want to use, then get the individual "v" values later ::: */
        const row = rows[i].c;

        /* ::: Add an empty object, which we'll fill data in a second. ::: */
        posts.push({});
        /* ::: Loop through the labeled columns in each row ::: */
        for (var j = 0; j < cols.length; j++) {
            /* ::: Enter the data from each column, named according to the column label 
             That lets us change the column labels in the spreadsheet if necessary, without having to come back and edit the code ::: */
            posts[i][cols[j].label.toLowerCase()] = row[j] ? row[j].v : '';
        }

        /* ::: Google Sheets provide dates as "Date(YYYY,MM,DD,HH,mm,ss)", so we want to parse that into a Date object ::: */
        if (posts[i].date && String(posts[i].date) != '') {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const dateVals = posts[i].date.replace('Date(', '').replace(')', '').split(',');
            const time = dateVals[3] ? `${dateVals[3]}:${dateVals[4]}:${dateVals[5]}` : `00:00:00`;
            posts[i].date = new Date(`${months[dateVals[1]]} ${dateVals[2]}, ${dateVals[0]} ${time}`);
        } else {
            /* ::: If the date is left empty, return the last second of day of 1999 ::: */
            posts[i].date = new Date(`December 31, 1999 23:59:59`);
        }

        /* ::: Make a display-friendly version of the date value ::: */
        posts[i].prettyDate = posts[i].date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        })

        /* ::: RSS needs the Coordinated Universal Time version of the date, as well ::: */
        posts[i].utcDate = posts[i].date.toUTCString();

        /* ::: Convert the "Markdown" cell from Markdown to HTML ::: */
        posts[i].html = converter.makeHtml(posts[i].markdown);

        /* ::: Give the post a url-friendly slug for linking ::: */
        posts[i].slug = posts[i].title ? posts[i].title.replace(/\s/g, '+') : Date.now();

        /* ::: Use that slug to give each post a unique URL ::: */
        posts[i].url = `https://${host}/posts/${posts[i].slug}`;
    }

    /* ::: Sort the posts by date ::: */
    posts.sort((a, b) => b.date - a.date);

    // console.log(posts);
    return posts;
}

/* ::: Get a single post ::: */
const getSinglePost = async (id, slug) => {
    console.log('getSinglePost()');
    //  const title = slug.replace(/\+/g,' ');

    /* ::: Really what we're doing here is getting all the posts, then narrowing it down to just one ::: */
    const posts = await getAllPosts(id);
    //return posts.find(post => post.title == title);
    return posts.find(post => post.slug == slug);
}

/* ::: Get the CSS for the blog, based on the "CSS" tab in their sheet ::: */
const getCSS = async id => {
    console.log('getCSS()');
    let cacheOverride = new CacheOverride("override", {
        ttl: 60
    });
    const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=CSS`, {
            backend: GDOCS,
            cacheOverride,
        });

    const text = await response.text();
    // console.log(text);

    /* ::: Cut out extraneous text from the sheet's JSON ::: */
    const json = JSON.parse(text.substr(47).slice(0, -2));

    /* ::: Remove blank rows -- unlike posts, we can assume that the first column is the "selector" and the second is the "rules", so we skip over getting the labels ::: */
    const rows = json.table.rows.filter((r, index) => r && index > 0);

    var css = '';

    rows.forEach(row => {
        var content = row.c;
        if (content[0] !== null) {
            css += `${content[0].v}{${content[1] ? content[1].v : ''}}`;
        }
    });

    // console.log(css);
    return css;
}

/* ::: Get the blog's SEO info from the "SEO" tab in their sheet */
const getSEO = async id => {
    console.log('getSEO()');

    let cacheOverride = new CacheOverride("override", {
        ttl: 60
    });
    const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=SEO`, {
            backend: GDOCS,
            cacheOverride,
        });

    const text = await response.text();

    /* ::: Cut out extraneous text from the sheet's JSON ::: */
    const json = JSON.parse(text.substr(47).slice(0, -2));

    /* ::: Get the label for each column, defined in row 1 of the spreadsheet ::: */
    const cols = json.table.rows[0].c.filter(c => c && c.v);

    /* ::: We only care about the content in row 2 ::: */
    const row = json.table.rows[1].c.filter(c => c && c.v);

    /* ::: Loop through the labeled columns ::: */
    var seo = {};
    for (var i = 0; i < cols.length; i++) {
        /* ::: Enter the data from each column, named according to the column label 
             That lets us change the column labels in the spreadsheet if necessary, without having to come back and edit the code ::: */
        seo[cols[i].v.toLowerCase()] = row[i] ? row[i].v : '';
    }

    /* ::: Convert any markdown in the description to HTML ::: */
    seo.html = converter.makeHtml(seo.description);

    // console.log(seo);
    return seo;
}

module.exports = {
    getAllPosts,
    getSinglePost,
    getCSS,
    getSEO
};
