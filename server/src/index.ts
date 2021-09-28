import "reflect-metadata";
import express from 'express';


(async() =>{
    const app = express();
    app.get('/', (_,res)=>(res.send("Hello World")));
    app.listen(4000,()=>{
        console.log("Running on 4000")
    })
})()