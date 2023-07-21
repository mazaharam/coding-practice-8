const express = require("express");
const bodyParser=require("body-parser")
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
app.use(bodyParser.json());

let db = null;

const InitializeDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database
    })
    app.listen(3000,() => {
      console.log("SERVER RUNNING");
    });
  } catch (e) {
    console.log(`DB ERROR ${e}`);
    process.exit(1);
  }
};

InitializeDB();

//API 1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  let result = "";
  let Query = "";

  const hasStatusproperty = (x) => {
    return x.status !== undefined;
  };
  const hasPriorityproperty = (x) => {
    return x.priority !== undefined;
  };

  const hasStatusandPriorityproperty = (x) => {
    return x.status !== undefined && x.priority !== undefined;
  };

  switch (true) {
    case hasStatusproperty(request.query):
      Query = `select * from todo
                              where status="${status}"`;
      break;
    case hasPriorityproperty(request.query):
      Query = `select * from todo
                          where priority="${priority}"`;
      break;
    case hasStatusandPriorityproperty(request.query):
      Query = `select * from todo 
                where status="${status}" and priority="${priority}"`;
                       break;
    default:
      Query = `select * from todo
                      where todo like "%${search_q}%"`;
  }
  console.log(search_q);

  result = await db.all(Query);
  response.send(result);
});

//API 2

app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const Query=`select * from todo 
    where id=${todoId}`
const result =await db.get(Query)
response.send(result)

});

//API 3 

app.post("/todos/",async(request,response)=>{
const  details=request.body;
console.log(request.body)
const {id,todo,priority,status}=details
console.log(id)
console.log(todo)
console.log(priority)
console.log(status)

const Query=`insert into todo
             (id,todo,priority,status)
             values ("${id}","${todo}","${priority}","${status}")`

const result=await db.run(Query)
response.send("Todo Successfully Added");

});


                   //API 4
app.put("/todos/:todoId/",async(request,response)=>{
  const {todoId}=request.params;
 let valueUpdate=null;
 console.log(request.body.status)
switch (true){
    case request.body.status!==undefined:
          valueUpdate="Status";
          break;
     case request.body.todo!==undefined:
          valueUpdate="Todo";
          break;
     case request.body.priority!==undefined:
          valueUpdate="Priority";
          break;
          
}
const previousQuery=  `select * from todo
where id=${todoId}`
const previousQueryTodo=await db.get(previousQuery)
const   {todo=previousQueryTodo.todo,
    status=previousQueryTodo.status,priority=previousQueryTodo.priority}=request.body
 const newQuery=    `update todo
                          set todo="${todo}",
                              status="${status}",
                              priority="${priority}"`
        await db.run(newQuery);
        response.send(`${valueUpdate} Updated`)
});


              //API 5
app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const Query=`delete from todo
    where id=${todoId}`
    await db.run(Query)
    response.send("Todo Deleted")

})





module.exports=app;
