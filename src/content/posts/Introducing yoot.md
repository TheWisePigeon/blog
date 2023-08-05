---
title: "Introducing YOOT"
publishedAt: 2023-08-05
description: "I have been working on this project for quite some time now, it's almost done so I wanted to give a little introduction to it"
slug: "introducing-yoot"
isPublish: true
---

## Introducing YOOT
Hello, thank you for taking the time to read this post. In this one I wanted to introduce a project that I have been working on, for quite some time now....

Anyway, I picked back the project roughly two months ago and now it has reached a MVP phase. Reason why I am writing this post. So without further bla bla,
let's get into the sauce.

## What is YOOT
It is a CMS, a minimalistic CMS focused on simplicity and ease of use. For me a CMS is just a place that you can go, a web place, create some data that will be
kept somewhere for you, and then you can manage and access that data later. This is exactly what YOOT does. It has a web console where you can create and interact with
your data and then we have a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) that exposes access to the data. As a little disclaimer, I want
to say that I would not recommend using YOOT for a production level app, I did not build it for that sake, keep in mind that it's just a goofy hobby project :) you can
definitely use it for your own goofy projects and even in a production app, I mean it's not THAT bad, but before making that choice, you should definitely think twice or
more.

## Key concepts
### Projects
YOOT's structure is a bit based on Relational databases structure. To use YOOT, you first have to create an account and login to get access to the console. Then you will
have to create a `Project`. A project kind of stands for a new database. In the earlier days of YOOT I wanted to call them `containers` instead, but I can't remember why I changed
my mind lol.

### Entities
Moving on, you will now have to get inside a project and create an `Entity`, they stand for the tables in this case. An entity has a name and a `Schema`. The schema describes the
entity's fields and their respective type. Here is an example of a Product entity.


More types will be added(or not) in the future. At the moment we have 4 types which are:
- Text: textual values like a name, an email...
- Number: any numerical value, integer or float
- Boolean: yes or no
- Image: you can upload images to yoot and the link to that image will be set as the value of the field

### Entries
Entries are the rows inside an entity. They are the data you will mostly be consuming in your external apps.

### API Keys
In order to access your data outside of YOOT, you will have to call our API. While creating an API key you will be asked for the permissions you want to give the key,
you can not change these permissions afterwards, you will have to create another key. The 
main permissions are:
- Read : Granted by default to the key
- Create: Gives the key the rights to create new data like entities and entries
- Write: Gives the key the rights to modify existing data
- Delete: You know what it does

We have an extended documentation of how to use the API at <a href="https://docs.yootcms.xyz" target="_blank">docs.yootcms.xyz</a> for more informations.

## Star and follow? 🥲
My github profile: <a href="https://github.com/TheWisePigeon" target="_blank">TheWisePigeon</a>

<a href="https://github.com/TheWisePigeon/yoot" target="_blank">YOOT on github</a>

Feel free to contribute, everything is open source.

YOOT will be available to use later the next week, so stay tuned
<a href="https://yootcms.xyz" target="_blank">https://yootcms.xyz</a>
