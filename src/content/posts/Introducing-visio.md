---
title: "Introducing Visio"
publishedAt: 2023-11-20
description: "Visio is an open source, cloud based service that provides facial recognition features"
slug: "introducing-visio"
isPublish: true
---

For the past month I have been working on this project in the shadows, and today I am very happy to introduce you to Visio.

## What is Visio
I describe it as an open source, cloud based service that offers facial recognition and detection features. Put more simply, it is just an API
that you send images to, to detect and process faces on the image.

## How does it work
I wrote Visio using Golang (and Sveltekit for the dashboard). I did not reinvent the wheel when it comes to facial recognition, under the hood, I am using [go-face](https://github.com/Kagami/go-face)
which is a Go library that provides bindings to [dlib](http://dlib.net/). Most of the magic happens in there, the rest of the service is just getting files from clients, authenticating the request,
uploading the file to the server and processing it. One thing that might cause a total rewrite in the future is that go-face only works with jpeg images for now.

## How to use it
You will mostly be using Visio to compare faces from images. There is a feature that can return the descriptor of a face if you would like to run your own algorythm on it. Let's see some examples:

### Creating a face
Creating a face means that you send a face to the API and the descriptor is stored in our database for you. You can access that "face" using it's id. Every call to the API must be authenticated using
a key that you can create [on your dashboard](https://getvisio.cloud/console/keys) after you login

An example using javascript in the browser
```js
const formData = new FormData()
const file = ... //read file data
formData.append('face', file)
const response = await fetch(
    "https://api.getvisio.cloud/v1/faces",
    {
        method:"POST",
        headers:{
            Authorization:"<your_api_key>"
        },
        body: formData
    }
)
```
If everything goes well the API should return a response containing the id of the created face. You can always see all your faces using this call which will return an array
```js
const response = await fetch(
    "https://api.getvisio.cloud/v1/faces",
    {
        headers:{
            Authorization:"<your_api_key>"
        },
    }
)
```
### Comparing faces
To compare faces you can either first create them on Visio and then compare them using their ids (which is the way I would recommend)
```js
const face_1 = "face1_id"
const face_2 = "face2_id"
const response = await fetch(
    "https://api.getvisio.cloud/v1/faces/compare",
    {
        method:"POST",
        headers:{
                Authorization:"<your_api_key>"
        },
        body: JSON.stringify({ face_1, face_2 })
    }
)
const { distance } = await response.json()
```
The API returns an object containing the "distance" field which is the euclidean distance between the two faces. The higher the distance, the more different the faces are
### Comparing 2 faces using uploads
If you don't want to create faces on Visio before comparing them you can always do it directly
```js
const face1_file = ... //read file data
const face2_file = ... //read file data
const formData = new FormData()
formData.append('face1', face1_file)
formData.append('face2', face2_file)
const response = await fetch(
    "https://api.getvisio.cloud/v1/faces/compare-images",
    {
        method:"POST",
        headers:{
            Authorization:"<your_api_key>"
        },
        body: formData
    }
)
const { distance } = await response.json()
```
That is an example of how you can compare two faces by uploading them directly to Visio.

## Error handling
Visio will always return comprehensive error messages to help you debug your code, 500 errors are returned if anything goes wrong on our side. Some good points to keep in mind:
* Visio only works with JPEG format for now
* Every image uploaded must contain only one face, an error will be returned if the image contains 0 or more than one face

## Wrapping up
Visio is still in a very early stage and my goal is to turn it into a robust service that other developers could use in their apps. Contributions are very welcome and please join the 
community on [Discord](https://discord.gg/9vDumSjK3F) so that we can shape Visio's future together. Also give me a star and a follow on [github](https://github.com/TheWisePigeon/visio).
Thank you for reading and hopefully talk to you on Discord :)

Pigeoff
