const express = require("express")
const request = require("request")
const crypto = require('crypto')
const https = require("https")
const bodyparser = require("body-parser")
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(bodyparser.urlencoded({ extended: true }))
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/register.html")
})
app.get('/login', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})
app.get('/home', (req, res) => {
  res.sendFile(__dirname + "/home.html")
})
app.use(express.static("public"))
function hash(input, salt) { //- Hashing Function
  var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
  return ["pdkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.post("/", function (req, res) {
  var firstname = req.body.fname
  var lastname = req.body.lname
  var email = req.body.name
  var batch = req.body.Batch
  var dept = req.body.Department

  // Hash Password
  // var salt = crypto.randomBytes(128).toString('hex')
  var pwd = req.body.password

  var data = {

    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstname,
        LNAME: lastname,
        BATCH: batch,
        DEPARTMENT: dept,
        PASSWORD: pwd,
      }

    }]
  };
  var jsondata = JSON.stringify(data);
  const url = "https://us1.api.mailchimp.com/3.0/lists/e004708641"
  const options = {
    method: "POST",
    auth: "Navya:99e71d39d268a544260f40961499fdca-us1"
  }
  const request = https.request(url, options, function (response) {
    if (response.statusCode === 200) {

      res.redirect('/login')

    }
    else {
      res.send("Error Occurred");
    }
    response.on("data", function (data) {
      console.log(JSON.parse(data));

    })

  })
  request.write(jsondata);
  request.end();
})

app.post('/login', (req, res) => {
  var { name, password } = req.body;
  const url = `https://us1.api.mailchimp.com/3.0/search-members?list_id=e004708641&query=${name}`
  const options = {
    method: "GET",
    auth: "Navya:99e71d39d268a544260f40961499fdca-us1"
  }
  const request = https.request(url, options, function (response) {
    if (response.statusCode !== 200) {
      res.status(500).send("Error Occurred");
    }
    response.on("data", function (data) {
      const result = JSON.parse(data);
      if (result.exact_matches && result.exact_matches.members.length > 0) {
        console.log(JSON.parse(data).exact_matches.members[0].merge_fields);
        if (result.exact_matches.members[0].merge_fields.PASSWORD === password) {
          console.log("User Authenticated");
          res.redirect('/home')
        }
        else {
          console.log("Wrong Password")
          res.status(400).send("Wrong Password");
        }
      }
      else {
        console.log("User doesn't exist");
        res.status(400).send("User doesn't exist");
      }

    })

  })
  request.end();
})


app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
})
//api key
//99e71d39d268a544260f40961499fdca-us1
//list key
//e004708641
