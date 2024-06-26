import polka from "polka";
import mysql from "mysql";
import util from "util";
import { config } from "dotenv";
import bodyParser from "body-parser";
const { json } = bodyParser;

// Load the dotenv config.
config();

console.log("[INFO] Connecting to DB...");
const connection = mysql.createConnection(process.env.CONNECTION_STRING);
const queryDb = util.promisify(connection.query).bind(connection);
console.log("[INFO] Connected!");

console.log("[INFO] Starting server...");
polka()
  .use(json())
  .get("/query", async (req, res) => {
    // Get the JSON encoded body.
    //const  query } = req.body;
    const { query } = req.query

    // If the query is undefined, return an error.
    if (query === undefined) {
      res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ error: "No query provided." }));
      console.log(req)
      return;
    }
    const { format } = req.query
    //console.log(req.query)

    
    //const format = query["format"]
    
    /*
    if (format) {
      console.log("using format: " + format)
    }
    */


    let response: any = [];
    try {
      // Run the query on the DB.
      response = await queryDb(query);
     
      // convert to simple arrays
      if (format == 'plotly') {
        //console.log("using plotly format")
        //console.log(response)

        const keys: any[]= Object.keys(response[0]) // tstamp, Wh

        // init the data dict
        let data= {}
        keys.forEach( (key) =>{
          data[key]=[]
        })
        // console.log(data)

        response.forEach( (element) => {
          // console.log(element)

          keys.forEach( (key) =>{
            //console.log(key)
            //console.log(data[key])
            data[key].push(element[key])
          })         
        });

        // console.log(data)
        response= data
      }
      


    } catch (e: any) {
      console.log(e);
      response = { error: e.message };
    }

    // Return the response.
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(response));
  })
  .listen(3001, () => {
    console.log("[INFO] Server started on port 3001");
  });
