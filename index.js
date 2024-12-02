const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const PORT = 3030
const app = express()

app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('template'));


app.get("/data", async (req, res)=>{
 try{
  const data = await fs.readFileSync(path.join(__dirname, 'data.json')); 
  res.json(JSON.parse(data)); 
 }catch(err){
  console.error(err)
 }
})

// app.get("/", async (req, res)=>{
//    res.sendFile('index.html')
//  })
//  app.get("/admin", async (req, res)=>{
//   res.sendFile('adming.html')
// })


app.put("/update", async (req, res)=>{
  try{
    if (req.body) { 
      await fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(req.body))
      res.json({
        message: "Date is update"
      }) 
    } else {
      res.json({
        message: "Body is empty"
      }) 
    }
  }catch(err){
    console.error(err)
  }
 })

app.listen(PORT, ()=>{
  console.log("Server listening http://localhost:"+PORT);
  
})