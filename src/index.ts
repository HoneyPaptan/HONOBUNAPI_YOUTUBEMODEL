import { Hono } from 'hono'
import {stream , streamText , streamSSE} from "hono/streaming"

import {poweredBy} from "hono/powered-by"
import {logger} from "hono/logger"
import dbConnect from './db/connect'
import FavYoutuberModel from './db/fav-youtube-model'
import { isValidObjectId } from 'mongoose'
const app = new Hono()
app.use(poweredBy())
app.use(logger())


dbConnect()
  .then(() => {
    //Get list 
    app.get('/', async(c) =>{
      const documents = await FavYoutuberModel.find()
      return c.json(
        documents.map((d) => d.toObject()),
        200
      )
    })

    // Create document
    app.post('/', async (c) =>{
      const formData = await c.req.json()
      if(!formData.thumbnailURL) delete formData.thumbnailURL
      const favytdocument = new FavYoutuberModel(formData)
      try {
        const document = await favytdocument.save()
        return c.json(document.toObject(), 200)
      } catch (error) {
        return c.json(
          (error as any)?.message || "INternal error",
          500
        )
        
      }
    })

    // view document by Id
    app.get("/:documentId", async (c) =>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid ID", 
        400
      )

      const document = await FavYoutuberModel.findById(id)
      if(!document) return c.json("document not found",  404)
      
        return c.json(document, 200)
    })

    // streeaming the document
    app.get('/d/:documentId', async (c) =>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid ID", 
        400
      )

      const document = await FavYoutuberModel.findById(id)
      if(!document) return c.json("document not found",  404)

        return streamText(c , async (stream) =>{
          stream.onAbort(()=>{
            console.log("aborted!");
            
          })
          for (let i = 0; i < document.decription.length; i++) {
            await stream.write(document.decription[i])
            await stream.sleep(100)
            
          }
        })
    })

    // updating the document
    app.patch('/:documentId', async (c)=>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid ID", 
        400
      )

      const document = await FavYoutuberModel.findById(id)
      if(!document) return c.json("document not found",  404)
      const formData = await c.req.json()
      if(!formData.thumbnailURL) delete formData.thumbnailURL

      try {
        const updateDocument = await FavYoutuberModel.findByIdAndUpdate(
          id,
          formData,
          {
            new: true
          }
        )
        return c.json(updateDocument?.toObject(), 200)
      } catch (error) {
        return c.json(
          (error as any)?.message || "document not found or could not be updated",
          500
        )
      }


    })


    // deleting the document
    app.delete("/:documentId" , async(c)=>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)) return c.json("Invalid ID", 
        400
      )
      try {
        const deletedDocument = await FavYoutuberModel.findByIdAndDelete(id)
        return c.json(deletedDocument?.toObject(), 200)
      } catch (error) {
        return c.json(
          (error as any)?.message || "document not found or could not be updated",
          500
        )
      }

      
    })







  })
  .catch((err) =>{
    app.get('/*', (c) =>{
      return c.text(`Failed to connect mongodb: ${err.message}`)
    })
  })

app.onError((err, c) =>{
  return c.text(`App error ${err.message}`)
})

export default app
