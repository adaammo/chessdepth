import { app } from "./app"
import dotenv from "dotenv"
dotenv.config({path: "dev.env"});

app.listen(8000, () => {
    console.log("listening on 8000")
})