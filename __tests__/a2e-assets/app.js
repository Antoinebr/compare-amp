const express = require('express');
const app = express();

app.use(express.static(`${__dirname}/../../dist/`));


app.get("/iframable/", async (req, res) => res.send('Hello I can be iFramed ') );


exports.app = app;


  

