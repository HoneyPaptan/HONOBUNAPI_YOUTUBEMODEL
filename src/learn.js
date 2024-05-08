import { Hono } from "hono";
import { v4 as uuid4} from "uuid"
import {stream , streamText , streamSSE} from "hono/streaming"
let videos = []

const app = new Hono()



app.get("/", (c) =>{
    return c.text("trying it part 1")
})

// for the post request it will always be an async function as it works in runtime
app.post("/video", async (c) =>{
    const {
        videoName,
        channelName,
        duration
    } = await c.req.json()
    const newVideo = {
        id: uuid4(),
        videoName,
        channelName,
        duration

    }
    videos.push(newVideo)
    return c.json(newVideo)
}) 

// read all data using stream
app.get("/videos",  (c) =>{
    return streamText(c, async(stream) =>{
        for (const video of videos){
            await stream.write(JSON.stringify(video))
            await stream.sleep(1000)
        }
    })
})

// read by id
app.get("/video/:id", (c) =>{
    const {id} = c.req.param()
    const video = videos.find((video) => video.id === id)
    if(!video){
        return c.json(({message: "Video not found"}))
    }
    return c.json(video)
})


export default app