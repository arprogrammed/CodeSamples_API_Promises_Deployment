//jshint esversion:6

// Initializes the app, mailchimp client, and other packages.
const { response } = require('express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const client = require("@mailchimp/mailchimp_marketing");

// MailChimp env vars can be assigned here.
const mcID = / Environment variable for key here /;
const mcListID = / Environment variable for key here /;
const serverPre = / Environment variable for key here /;

// Initializing the Body Parser and a Static folder for images.
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Routing for displaying the main page with signup form.
app.get('/', function (req, res){
    res.sendFile(__dirname + '/signup.html');
});

// Routing to the success/failure page from POST is in promise.
app.post('/', function (req, res){
    const eMail = req.body.email;
    const firstName = req.body.fName;
    const lastName = req.body.lName;

    client.setConfig({
        apiKey: mcID,
        server: serverPre,
      });
      
      // Promise passes in the information to subscribe the user to the mailing list.
      const run = async () => {
        const response = await client.lists.addListMember(mcListID, {
          email_address: eMail,
          status: "pending",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        }).then(
            (value) => {
                res.sendFile(__dirname + '/success.html');
            },
            (reason) => {
                res.sendFile(__dirname + '/failure.html');
            });
      };
      // .then with the Value aspect passes in a sucessful response
      // but the Reason will contain unsuccessful responses
      // These are success or failure handlers from the promise

      run();
      
});

// Exporting the app for hosting on Deta.
module.exports = app;