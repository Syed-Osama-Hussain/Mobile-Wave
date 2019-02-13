var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    methodOverride= require("method-override"),
    passport      = require("passport"),
    localStrategy = require("passport-local"),
    moment        = require("moment"),
    multer        = require("multer"),
    path          = require("path"),
    flash         = require("connect-flash"),
    fs            = require("fs"),
    glide         = require("@glidejs/glide"),
    Device        = require("./models/device"),
    User          = require("./models/user"),
    Order         = require("./models/order");
    


    var url = process.env.DATABASEURL || "mongodb://localhost/mobileWave"  
mongoose.connect(url, { useNewUrlParser: true });

app.use(flash());
app.use(require("express-session")({
  secret: "Once again this is a secret",
  resave: false,
  saveUninitialized: false
}));    
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.min = 0;
  res.locals.max = 1000000000;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));


var storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: function(req,file,cb){
    cb(null,file.filename + "-" + Date.now() + path.extname(file.originalname));
    }
});

app.use(multer({
  storage: storage
 }).array("image",5));


app.get("/",function(req,res){
  res.render("landing");
});


app.get("/home",function(req,res){
  
  Device.find({},function(err,devices){
    if(err){
      console.log(err);
    }else{
      res.render("home", {devices: devices,moment: moment});
    }
  }).limit(8);
});


app.get("/devices",function(req,res){
  Device.find({},function(err,devices){
    if(err){
      console.log(err);
    }else{
      var i = 0;
      res.render("device", {devices: devices,moment: moment,i:i});
    }
  });
});


app.get("/device/new",isLoggedIn,function(req,res){
  res.render("new");
});


app.post("/device",isLoggedIn,function(req,res){

  var model = req.body.device.model;
  var company = req.body.device.company;
  company = company.charAt(0).toUpperCase() + company.slice(1);
  var description = req.body.device.description;
  var  price = req.body.device.price ;
  var  type = req.body.device.type.toLowerCase();
  var  time = moment();
  var fileloc = [];
  req.files.forEach(function(file){
      fileloc.push(file.filename);
  });


  var newDevice = {model: model,company: company,description: description,price: price,type: type,time: time,fileloc: fileloc};
  
   Device.create(newDevice,function(err,device){
     if(err){
       console.log("Error!!!");
       console.log(err);
     }
   });
   res.redirect("/home");
});


app.get("/device/:id",function(req,res){
  Device.findById(req.params.id,function(err,device){
    if(err){
      console.log(err);
    }else{
      var i =0;
      res.render("show",{device: device,moment: moment,i: i});
    }
  });
});


app.get("/device/:id/edit",isLoggedIn,function(req,res){
    
      Device.findById(req.params.id,function(err,found){
      res.render("edit",{device: found});
});
});

app.put("/device/:id",isLoggedIn,function(req,res){
   
  Device.findByIdAndUpdate(req.params.id,req.body.device,function(err,found){
      if(err){
        res.redirect("/home");
      }else{
        res.redirect("/device/" + req.params.id);
      }
    });
  });


  app.delete("/device/:id",isLoggedIn,function(req,res){
    
    Device.findById(req.params.id,function(err,device){
      if(err){
        console.log(err);
      }else{
        device.fileloc.forEach(function(file){
          fs.unlinkSync("E:/WebDevelopment/BackEnd/mobileWave/public/uploads/"+file);
        });
      }
    });
    
    Device.findByIdAndRemove(req.params.id,function(err){
      if(err){
        res.redirect("/home");
      }else{

        req.flash("success","Advertise deleted.");
        res.redirect("/home");
      }
    });
  });


app.get("/contact",function(req,res){
  res.render("contact");
});  

app.post("/:device/price",function(req,res){
  Device.find({price:{$gt:req.body.min,$lt:req.body.max},type: req.params.device},function(err,devices){
    if(err){
      console.log(err);
    }else{
      var i = 0;
      res.render("device",{devices:devices,min:req.body.min,max:req.body.max,moment: moment,i:i});
    }
  });
});


app.get("/order",isLoggedIn,function(req,res){
  Order.find({}).populate("device").exec(function(err,orders){
    if(err){
      console.log(err);
    }else{
      res.render("orders",{orders:orders,moment: moment});
    }
  });
});


app.get("/device/:id/order",function(req,res){
  res.render("order",{id: req.params.id});
});


app.post("/order/:id",function(req,res){
  Device.findById(req.params.id,function(err,device){
    if(err){
      console.log(err);
    }else{
      Order.create({device:device,name:req.body.name,phone:req.body.number,time:moment()},function(err,order){
           if(err){
             console.log(err);
           }else{
              console.log(order);
              req.flash("success","Your order has been placed.");
              res.redirect("/home");     
           }   
      });
    }
  });
});


app.delete("/order/:id",isLoggedIn,function(req,res){
    
  Order.findByIdAndRemove(req.params.id,function(err){
    if(err){
      console.log(err);
    }else{
      req.flash("success","Order Deleted!");
      res.redirect("/home");
    }
  });
});


/*app.get("/register",function(req,res){
  res.render("register");
});


app.post("/register",function(req,res){
  
  var newUser = new User({username: req.body.username});

  User.register(newUser,req.body.password,function(err,user){
    if(err){
      req.flash("error",err.message);
      return res.redirect("/register");
    }
      passport.authenticate("local")(req,res,function(){
        req.flash("success","Welcome to Mobile Wave "+ user.username + ".");
        res.redirect("/home");
      });
 });

});
*/

app.get("/login",function(req,res){
  res.render("login");
});


app.post("/login",passport.authenticate("local",{
   successRedirect: "/home",
   failureRedirect: "/login"
}),function(req,res){ 
});


app.get("/logout",function(req,res){
  req.logOut();
  req.flash("success","Logged you out!");
  res.redirect("/home");
});


app.get("/:device",function(req,res){
  Device.find({type:req.params.device},function(err,devices){
   if(err){
     console.log(err);
   }else{
     var i = 0;
     res.render("device",{devices: devices,moment: moment,i:i});
   }  
  });
});


app.get("/:device/:company",function(req,res){
  Device.find({type: req.params.device, company: req.params.company},function(err,devices){
      if(err){
        console.log(err);
      }else{
        //console.log(devices[0]);
        var i = 0;
        res.render("device",{devices: devices,moment: moment,i:i});
      }
  });
});


var port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function() {
console.log("Listening on Port 3000");
});



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}