const { app } = require('./app');


process.env.PORT = process.env.PORT || 8373;
// we run the express app 
server = app.listen(process.env.PORT);