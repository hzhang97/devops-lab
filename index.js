const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({ extended: true}));

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "zoo",
    port:"8889"
});

// ------------ Firewall --------------------------------------------------
app.use(function(req, res, next) {
    if ("key" in req.query) {
        var query = "SELECT * FROM users WHERE apikey='" + req.query["key"] + "'";

        db.query(query, function(err, result, fields) {
            if (err) throw err;
            if (Object.keys(result).length > 0) {
                next();
            } else {
                res.status(403).send("Access denied");
            }
        });
    } else {
        res.status(403).send("Acces denied");
    }
});
//-------------------------------------------------------------------------


// ------------ STATS -----------------------------------------------------
app.get('/food-stats',function (req,res) {
    var query = "SELECT animals.id,food_per_day,SUM(quantity) AS food FROM animals LEFT JOIN food ON animals.id=food.id_animal GROUP BY animals.id, food_per_day ";
    db.query(query, function(err,result, fields){
        if (err) throw err;
        var list = [];
        // result is round down
        Object.keys(result).forEach(function(key) {
            var t = result[key];
            // number of day left
            var day;
            // value of the id
            var id = t.id;
            // if the food_per_day of an animal is 0, the number of day left is set to be 0
            if (t.food == 0) {
                day = 0;
            } else {
                // remainder of the division 
                var r = t.food%t.food_per_day;
                // number of day left
                day = (t.food-r)/t.food_per_day;
                console.log(day);
            }
            list.push({"id_animal": id, "day_left": day});
        });
        res.send( JSON.stringify(list));
    });  
});
//-------------------------------------------------------------------------


// ------------ CREATION: post --------------------------------------------
/* example 
  http://localhost:3000/animals?breed=lion&food_per_day=12&entry_date=2008-11-12&id_cage=1
  http://localhost:3000/cages?area=22&name=cagelion
  http://localhost:3000/food?quantity=200&id_animal=1&name=meat
  http://localhost:3000/staff?firstname=George&lastname=Dragonvale&wage=1200
*/
app.post('/animals', function(req, res) {
    // keys required to add an animal
    if (("breed"||"id_cage"||"food"||"entry_date") in req.query){
        var query = "INSERT INTO animals VALUES";
        // contains attributes fo the animal
        var mes = " (";
        // id
        if ("id" in req.query) 
            mes += req.query["id"];
        else 
            mes += "NULL";
        // name
        if ("name" in req.query)
            mes += ",'" + req.query["name"] + "'";
        else
            mes += ",''";
        // breed (mandatory)
        mes += ", '" + req.query["breed"] + "'";
        // daily_food (mandatory)
        mes += ", " + req.query["food_per_day"];
        // birthday
        if ("birthday" in req.query)
            mes += ", '" + req.query["birthday"] + "'";
        else // if the birthday is unknow, it takes the value of the date_entry
            mes += ", '" + req.query["entry_date"] + "'";
        // date_entry (mandatory)
        mes += ", '" + req.query["entry_date"] + "'";
        // id_cage (mandatory)
        mes += ", " + req.query["id_cage"] + ");"

        query += mes;
        // send request
        db.query(query, function(err,result, fields) {
            if (err) throw err;       
            res.send(JSON.stringify("Animal added" + mes));
        }); 
    } else {
        res.send(JSON.stringify("Please give information about the animal"));
        // res.send(JSON.stringify(req.query.lenght));
    }    
});

app.post('/cages',function (req,res) {
    // keys required to add an cage
    if (("name"||"area") in req.query) {
        var query = "INSERT INTO cages VALUES";
        // contains attributes of the cage
        var mes = " (";

        // id
        if ("id" in req.query) 
            mes += req.query["id"];
        else 
            mes += "NULL";
        // name of the cage (mandatory)
        mes += ",'" + req.query["name"] + "'";
        // description
        if ("description" in req.query)
            mes += ",'" + req.query["description"] + "'";
        else 
            mes += ",''";
        // area (mandatory)
        mes += "," + req.query["area"] + ");";
        
        query += mes;
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("cage added" + mes));
        }); 
    } else {
        res.send(JSON.stringify("Please give information about the cage"));
    }
});

app.post('/food',function (req,res) {
    // keys required to add food
    if (("name"||"quantity"||"id_animal") in req.query) {
        var query = "INSERT INTO food VALUES";
        // contains attributes of the food
        var mes = " (";
        // id
        if ("id" in req.query) 
            mes += req.query["id"];
        else 
            mes += "NULL";
        // name of the food (mandatory)
        mes += ",'" + req.query["name"] + "'";
        // quantity of food (mandatory)
        mes += "," + req.query["quantity"] + "";
        // to which animal is the food (mandatory)
        mes += "," + req.query["id_animal"] + ")"

        query += mes;
        // send request
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("food added" + mes));
        });
    } else {
        res.send(JSON.stringify("Please give information about the food"));
    }   
});

app.post('/staff',function (req,res) {
    // keys required to add staff
    if (("firstname"||"lastname") in req.query) {
        var query = "INSERT INTO staff VALUES";
        // contains attributes of the staff
        var mes = " (";
        // id
        if ("id" in req.query) 
            mes += req.query["id"];
        else 
            mes += "NULL";
        // firstname (mandatory)
        mes += ", '" + req.query["firstname"] + "'";

        // lastname (mandatory)
        mes += ", '" + req.query["lastname"] + "'";
        
        // wage
        if ("wage" in req.query) 
            mes += ", " + req.query["wage"] + ")";
        else  // if wage is not given, the staff work for free
            mes += ", 0)";
        query += mes;

        // send request
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("staff added" + mes));
        });
    } else {
        res.send(JSON.stringify("Please give more details about the staff"));
    } 
});
//-------------------------------------------------------------------------


// ------------ READ: get -------------------------------------------------
app.get('/animals', function (req, res) {
    var query = "SELECT * FROM animals";

    // conditions with different possible criteria
    if ((("id"&&"name"&&"breed"&&"food_per_day") in req.query)||(("birthday"&&"entry_day"&&"id_cage") in req.query)) {
        // list of possible condition
        var list = ["id", "name", "breed", "food_per_day", "birthday", "entry_day", "id_cage"];
        // make a list of the condition criteria
        var cond = [];
        // size of the list
        var c = 0;
        Object.keys(list).forEach(function(key) {
            if (list[key] in req.query) {
                cond.push(list[key]);
                c++;
            }
        });
        // creation of the condition with the list of names' columns
        query += " WHERE";
        // if there is only 1 condition
        if (c == 1) {
            query += " " + cond[0] + "=" + req.query[cond[0]];
        }
            
        // if there are several conditions
        else {
            for (var i = 0; i < c-1; i++) {
                query += " " + cond[i] + "=" + req.query[cond[i]] + " AND";
            }
            query += " " + cond[c-1] + "=" + req.query[cond[c-1]];
        }
    }
    // sort
    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        var mes = " ORDER BY";
        
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            mes += " " + field;     
            if (direction == "-")
                mes +=  " DESC,";
            else
                mes += " ASC,";
        }
        query += mes.slice(0, -1);
    }
    // fields
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }
    // pagination
    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query)
            query += " OFFSET " + req.query["offset"];
    }

    db.query(query, function(err,result, fields){
        if (err) throw err; 
        res.send( JSON.stringify(result));
    }); 
});

app.get('/cages', function (req, res) {
    var query = "SELECT * FROM cages";
    //conditions with different possible criteria
    if (("id"&&"name"&&"description"&&"area") in req.query) {
        // list of possible condition
        var list = ["id", "name", "description", "area"];
        // make a list of the condition criteria
        var cond = [];
        // size of the list
        var c = 0;
        Object.keys(list).forEach(function(key) {
            if (list[key] in req.query) {
                cond.push(list[key]);
                c++;
            }
        });
        // creation of the condition with the list of names' columns
        query += " WHERE";
        // if there is only 1 condition
        if (c == 1) 
            query += " " + cond[0] + "=" + req.query[cond[0]];
        // if there are several conditions
        else {
            for (var i = 0; i < c-1; i++) {
                query += " " + cond[i] + "=" + req.query[cond[i]] + " AND";
            }
            query += " " + cond[c-1] + "=" + req.query[cond[c-1]];
        }
    }
    // sort
    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        var mes = " ORDER BY";
        
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            mes += " " + field;     
            if (direction == "-")
                mes +=  " DESC,";
            else
                mes += " ASC,";
        }
        query += mes.slice(0, -1);
    }
    // fields
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }
    // pagination
    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query)
            query += " OFFSET " + req.query["offset"];
    }

    db.query(query, function(err,result, fields){
        if (err) throw err; 
        res.send( JSON.stringify(result));
    }); 
});

app.get('/food', function (req, res) {
    var query = "SELECT * FROM food";

    // conditions with different possible criteria
    if (("id"&&"name"&&"quantity"&&"id_animal") in req.query) {
        // list of possible condition
        var list = ["id", "name", "quantity", "id_animal"];
        // make a list of the condition criteria
        var cond = [];
        // size of the list
        var c = 0;
        Object.keys(list).forEach(function(key) {
            if (list[key] in req.query) {
                cond.push(list[key]);
                c++;
            }
        });
        // creation of the condition with the list of names' columns
        query += " WHERE";
        // if there is only 1 condition
        if (c == 1) {
            query += " " + cond[0] + "=" + req.query[cond[0]];
        }
        // if there are several conditions
        else {
            for (var i = 0; i < c-1; i++) {
                query += " " + cond[i] + "=" + req.query[cond[i]] + " AND";
            }
            query += " " + cond[c-1] + "=" + req.query[cond[c-1]];
        }
    }
    // sort
    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        var mes = " ORDER BY";
        
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            mes += " " + field;     
            if (direction == "-")
                mes +=  " DESC,";
            else
                mes += " ASC,";
        }
        query += mes.slice(0, -1);
    }
    // fields
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }
    // pagination
    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query)
            query += " OFFSET " + req.query["offset"];
    }

    db.query(query, function(err,result, fields){
        if (err) throw err; 
        res.send( JSON.stringify(result));
    }); 
});

app.get('/staff', function (req, res) {
    var query = "SELECT * FROM staff";

    //conditions with different possible criteria
    if (("id"&&"firstname"&&"lastname"&&"wage") in req.query) {
        // list of possible condition
        var list =["id", "firstname", "lastname", "wage"];
        // make a list of the condition criteria
        var cond = [];
        // size of the list
        var c = 0;
        Object.keys(list).forEach(function(key) {
            if (list[key] in req.query) {
                cond.push(list[key]);
                c++;
            }
        });
        // creation of the condition with the list of names' columns
        query += " WHERE";
        // if there is only 1 condition
        if (c == 1) 
            query += " " + cond[0] + "=" + req.query[cond[0]];
        // if there are several conditions
        else {
            for (var i = 0; i < c-1; i++) {
                query += " " + cond[i] + "=" + req.query[cond[i]] + " AND";
            }
            query += " " + cond[c-1] + "=" + req.query[cond[c-1]];
        }
    }
    // sort
    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        var mes = " ORDER BY";
        
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            mes += " " + field;     
            if (direction == "-")
                mes +=  " DESC,";
            else
                mes += " ASC,";
        }
        query += mes.slice(0, -1);
    }
    // fields
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }
    // pagination
    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query)
            query += " OFFSET " + req.query["offset"];
    }

    db.query(query, function(err,result, fields){
        if (err) throw err; 
        res.send( JSON.stringify(result));
    }); 
});
//-------------------------------------------------------------------------



// ------------ MODIFICATION: put ----------------------------------------- 
app.put('/animals',function (req,res) {
    // console.log(req.url);
    console.log(req.query["id"]);
    var query = "UPDATE animals SET";
    var list = ["id", "name", "breed", "food_per_day", "birthday", "entry_day", "id_cage"];
    var cond = [];
    // make a list of column and condition
    Object.keys(list).forEach(function(key) {
        if (list[key] in req.query) {
            cond.push(list[key]);
        }
    });
    var set = " ";
    var co = " WHERE ";
    Object.keys(cond).forEach(function(key) {
        var sort = cond[key].split(",");
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            //mes += " " + field;     
            if (direction == "s")
                set += cond[key] + "=" + field + ", ";
                //mes +=  " DESC,";
            else
                co += cond[key] + "=" + field + ", ";
        }
        set = set.slice(0, -1);
        co = co.slice(0,-1);
    });

    query += set + co;
        
        
        

    db.query(query, function(err,result, fields){
        if (err) throw err;
        res.send( JSON.stringify("Tuples updated"));
    });  
});

app.put('/cages',function (req,res) {
    // console.log(req.url);
    console.log(req.query["id"]);
    var query = "UPDATE cages SET";
    var list = ["id", "name", "description", "area"];
    var cond = [];
    // make a list of column and condition
    Object.keys(list).forEach(function(key) {
        if (list[key] in req.query) {
            cond.push(list[key]);
        }
    });
    var set = " ";
    var co = " WHERE ";
    Object.keys(cond).forEach(function(key) {
        var sort = cond[key].split(",");
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            //mes += " " + field;     
            if (direction == "s")
                set += cond[key] + "=" + field + ", ";
                //mes +=  " DESC,";
            else
                co += cond[key] + "=" + field + ", ";
        }
        set = set.slice(0, -1);
        co = co.slice(0,-1);
    });

    query += set + co;
        
    db.query(query, function(err,result, fields){
        if (err) throw err;
        res.send( JSON.stringify("Tuples updated"));
    });  
});

app.put('/food',function (req,res) {
    // console.log(req.url);
    console.log(req.query["id"]);
    var query = "UPDATE cages SET";
    var list = ["id", "name", "quantity", "id_animal"];
    var cond = [];
    // make a list of column and condition
    Object.keys(list).forEach(function(key) {
        if (list[key] in req.query) {
            cond.push(list[key]);
        }
    });
    var set = " ";
    var co = " WHERE ";
    Object.keys(cond).forEach(function(key) {
        var sort = cond[key].split(",");
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            //mes += " " + field;     
            if (direction == "s")
                set += cond[key] + "=" + field + ", ";
                //mes +=  " DESC,";
            else
                co += cond[key] + "=" + field + ", ";
        }
        set = set.slice(0, -1);
        co = co.slice(0,-1);
    });

    query += set + co;
        
    db.query(query, function(err,result, fields){
        if (err) throw err;
        res.send( JSON.stringify("Tuples updated"));
    });  
});

app.put('/staff',function (req,res) {
    // console.log(req.url);
    console.log(req.query["id"]);
    var query = "UPDATE cages SET";
    var list = ["id", "firstname", "lastname", "wage"];
    var cond = [];
    // make a list of column and condition
    Object.keys(list).forEach(function(key) {
        if (list[key] in req.query) {
            cond.push(list[key]);
        }
    });
    var set = " ";
    var co = " WHERE ";
    Object.keys(cond).forEach(function(key) {
        var sort = cond[key].split(",");
        for (var index in sort) {
            var direction = sort[index].substr(0,1);
            var field = sort[index].substr(1);                       
            //mes += " " + field;     
            if (direction == "s")
                set += cond[key] + "=" + field + ", ";
                //mes +=  " DESC,";
            else
                co += cond[key] + "=" + field + ", ";
        }
        set = set.slice(0, -1);
        co = co.slice(0,-1);
    });

    query += set + co;
        
    db.query(query, function(err,result, fields){
        if (err) throw err;
        res.send( JSON.stringify("Tuples updated"));
    });  
});
//-------------------------------------------------------------------------


// ------------ DELETION: delete ------------------------------------------
/*
http://localhost:3000/animals?id=12
http://localhost:3000/cages?id=11
http://localhost:3000/food?id=3
http://localhost:3000/staff?id=3
*/
app.delete('/animals',function (req,res) {
    var query;
    // id is required to delete a tuple
    if ("id" in req.query){
        query = "DELETE FROM animals WHERE id = "+ req.query["id"];
        //var mes = "id = " + req.query["id"];
        if ("name" in req.query)
            query += " AND name ='" + req.query["name"] + "'";
        if ("breed" in req.query)
            query += " AND breed ='" + req.query["breed"] + "'";
        if ("food_per_day" in req.query)
            query += " AND food_per_day=" + req.query["food_per_day"];
        if ("birthday" in req.query)
            query += " AND birthday ='" + req.query["birthday"] + "'";
        if ("entry_date" in req.query)
            query += " AND entry_date ='" + req.query["entry_date"] + "'";
        if ("id_cage" in req.query)
            query += " AND id_cage ='" + req.query["id_cage"] + "'";
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("animal " + req.query["id"] + " deleted"));
        });     
    } else {
        query = "DELETE FROM animals";
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("all data of animals deleted"));
        });
    }
});

app.delete('/cages',function (req,res) {
    var query;
    // id is required to delete a tuple
    if ("id" in req.query){
        query = "DELETE FROM cages WHERE id = "+ req.query["id"];
        if ("name" in req.query)
            query += " AND name ='" + req.query["name"] + "'";
        if ("description" in req.query)
            query += " AND description ='" + req.query["description"] + "'";
        if ("area" in req.query)
            query += " AND area=" + req.query["area"];
        
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("cage " + req.query["id"] + " deleted" ));
        });  
    } else {
        query = "DELETE FROM cages";
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("all data of cages deleted"));
        }); 
    } 
    
});

app.delete('/food',function (req,res) {
    var query;
    // id is required to delete a tuple
    if ("id" in req.query){
        query = "DELETE FROM food WHERE id = "+ req.query["id"];
        if ("name" in req.query)
            query += " AND name ='" + req.query["name"] + "'";
        if ("quantity" in req.query)
            query += " AND quantity =" + req.query["quantity"];
        if ("id_animal" in req.query)
            query += " AND id_animal=" + req.query["id_animal"];
        
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("food " + req.query["id"] + " deleted" ));
        });  
    } else {
        query = "DELETE FROM food";
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("all data of food deleted"));
        }); 
    } 
    
});

app.delete('/staff',function (req,res) {
    var query;
    // id is required to delete a tuple
    if ("id" in req.query){
        query = "DELETE FROM staff WHERE id = "+ req.query["id"];
        if ("firstname" in req.query)
            query += " AND firstname ='" + req.query["firstname"] + "'";
        if ("lastname" in req.query)
            query += " AND lastname =" + req.query["lastname"];
        if ("wage" in req.query)
            query += " AND wage=" + req.query["wage"];
        
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("staff " + req.query["id"] + " deleted" ));
        });  
    } else {
        query = "DELETE FROM staff";
        db.query(query, function(err,result, fields){
            if (err) throw err;
            res.send( JSON.stringify("all data of staff deleted"));
        }); 
    } 
});
//-------------------------------------------------------------------------


app.listen(3000, function() {
    db.connect(function(err){
        if (err) throw err;
        console.log('Connection to database succefull');
    })
    console.log('Example app listening on port 3000!');
});
