const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const fileUpload = require("express-fileupload");

const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the entered username and password are correct (e.g., "admin", "admin")
  if (username === 'admin' && password === 'admin') {
    // Store authentication status in session
    req.session.authenticated = true;
    res.redirect('/dashboard'); // Redirect to the dashboard
  } else {
    res.render('login', { message: 'Invalid username or password' }); // Render the login page with an error message
  }
});

app.get('/login', (req, res) => {
  res.render('login',{message: ''});           // Render the login.ejs template
});
const isAuthenticated = (req, res, next) => {
  if (req.session.authenticated) {
    next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    res.redirect('/login'); // User is not authenticated, redirect to the login page
  }
};

app.get('/edit', isAuthenticated, (req, res) => {
  const authenticated = req.session.authenticated;
  const id = req.query.id;
  fs.readFile("submittedData.json", (err, data) => {
    const user = JSON.parse(data);
    const Data = user.find((user) => user.id == id);

    Data.cities = ["Lahore", "Karachi", "Islamabad", "Quetta"];
    Data.language = ["PHP", "C", "C#", "Java", "Node"];
    console.log(Data);
    const subjects = ["Algorithms", "OOP", "DataStructures"];
    const selectedCity = Data.city;
    const selectedLanguages = Data.languages; // Define the selectedLanguages variable
    res.render("edit", { authenticated, ...Data, subjects, selectedCity, selectedLanguages }); // Pass authenticated status, Data, subjects, selectedCity, and selectedLanguages to the template
  });
});


app.get('/delete', isAuthenticated, (req, res) => {
  const id = req.query.id;
  fs.readFile("submittedData.json", (err, data) => {
    const user = JSON.parse(data);
    const Data = user.filter((user) => user.id != id);
    const fdata = JSON.stringify(Data);
    fs.writeFile("submittedData.json", fdata, (err) => {
      res.redirect("/dashboard");});
    });});

let pastData = [];
app.use(express.static("public"));
app.use(express.static("public/uploads"));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // We set limits to MB
  })
);
app.use(bodyParser.urlencoded());
app.set("view engine", "ejs");

app.get("/student", (req, res) => {
  const cities = ["Lahore", "Karachi", "Islamabad", "Quetta"];
  const languages = ["PHP", "C", "C#", "Java", "Node"];
  const data = { cities, languages };
  // console.log(data);
  // res.redirect("/dashboard");
  res.render("student", data);

});
app.get("/",(req, res) => {
  res.redirect("/dashboard");  
});

app.post("/form-handler", (req, res) => {
  const cv = req.files.file;
  const pic = req.files.pic;
  const picName = pic.name;
  const cvName = cv.name;
  const picPath = __dirname + "/public/upload/images/" + picName;
  const cvPath = __dirname + "/public/upload/cv/" + cvName;

  pic.mv(picPath, (err) => {
    console.log("");
  });
  cv.mv(cvPath, (err) => {
    console.log("");
  });

  var currentTime = new Date();
  var uniqueId = currentTime.getTime();
  const body = req.body;
  body.profile = picName;
  body.cv = cvName;
  body.id = uniqueId;

  console.log(body);
  fs.readFile("submittedData.json", (err, data) => {
    if (err) {
      pastData.push(body);
      const fdata = JSON.stringify(pastData);
      fs.writeFile("submittedData.json", fdata, (err) => {
        res.redirect("/show-data");
      });
    } else {
      pastData = JSON.parse(data);
      pastData.push(body);
      fs.writeFile("submittedData.json", JSON.stringify(pastData), (err) => {
        res.redirect("/show-data");
      });
    }
  });
});

app.get("/show-data", (req, res) => {
  fs.readFile("submittedData.json", (err, data) => {
    user = data.toString();
    const jsonData = JSON.parse(user);
    console.log(jsonData);
    res.render("data", { jsonData });
  });
});

app.get("/download", (req, res) => {
  const name = req.query.filename;
  res.download(__dirname + "/public/upload/cv/" + name);
});

// app.get("/dashboard", (req, res) => {
//   fs.readFile("submittedData.json", (err, data) => {
//     const user = JSON.parse(data);
//     res.render("dashboard", { user });
//   });
// });

app.get('/dashboard', (req, res) => {
  if (req.session.authenticated) {
    // User is authenticated, retrieve data and render the dashboard with full functionality
    fs.readFile('submittedData.json', (err, data) => {
      const user = JSON.parse(data);
      res.render('dashboard', { user, authenticated: true });
    });
  } else {
    // User is not authenticated, retrieve data and render the dashboard without record manipulation links
    fs.readFile('submittedData.json', (err, data) => {
      const user = JSON.parse(data);
      res.render('dashboard', { user, authenticated: false });
    });
  }
});

app.get("/faqs", (req, res) => {
  const faqs = [
    {
      question: "How are you Sohaib, If you have any question then ask me",
      answer: "I am Fine and You",
    },
    {
      question: "How are you Sohaib, If you have any question then ask me",
      answer: "I am Fine and You",
    },
  ];

  res.render("faqs", { faqs });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/view", (req, res) => {
  var jsonData = [];
  const id = req.query.id;
  fs.readFile("submittedData.json", (err, data) => {
    const user = JSON.parse(data);
    jsonData.push(user.find((user) => user.id == id));
    res.render("data", { jsonData });
  });
});

// app.get("/delete", (req, res) => {
//   const id = req.query.id;
//   fs.readFile("submittedData.json", (err, data) => {
//     const user = JSON.parse(data);
//     const Data = user.filter((user) => user.id != id);
//     const fdata = JSON.stringify(Data);
//     fs.writeFile("submittedData.json", fdata, (err) => {
//       res.redirect("/dashboard");
//     });
//   });
// });

// app.get("/edit", (req, res) => {
//   const id = req.query.id;
//   fs.readFile("submittedData.json", (err, data) => {
//     const user = JSON.parse(data);
//     const Data = user.find((user) => user.id == id);

//     Data.cities = ["Lahore", "Karachi", "Islamabad", "Quetta"];
//     Data.language = ["PHP", "C", "C#", "Java", "Node"];
//     console.log(Data);
//     res.render("edit", Data);
//   });
// });

app.post("/update", (req, res) => {
  const cv = req.files.file;
  const pic = req.files.pic;
  const picName = pic.name;
  const cvName = cv.name;
  const picPath = __dirname + "/public/upload/images/" + picName;
  const cvPath = __dirname + "/public/upload/cv/" + cvName;

  pic.mv(picPath, (err) => {
    console.log("");
  });
  cv.mv(cvPath, (err) => {
    console.log("");
  });

  const id = req.query.id;
  fs.readFile("submittedData.json", (err, data) => {
    const user = JSON.parse(data);
    const Data = user.filter((user) => user.id != id);
    const updatedData = req.body;
    updatedData.id = id;

    updatedData.profile = picName;
    updatedData.cv = cvName;
    Data.push(updatedData);
    const fdata = JSON.stringify(Data);
    fs.writeFile("submittedData.json", fdata, () => {
      res.redirect("/show-data");
    });
  });
});
app.listen(7000, () => {
  console.log("Server : http://localhost:7000");
});
