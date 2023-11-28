---
title: "Simple and secure authentication with Github oauth"
publishedAt: 2023-11-28
description: "Learn how to implement Github oauth on your Golang server"
slug: "golang-github-oauth"
isPublish: true
---

## Introduction
Hello reader. In this article you will learn how to implement Github oauth in your apps using Golang on the server. I will be using Sveltekit for the client app but don't worry about it because
we only need it to test the backend logic. Let's dive in

### How does Oauth work
First we need to understand how oauth work under the hood, for the matter I made a simple diagram

![Oauth flow](/oauth.png)

What is going on there? Let's go through it step by step and applying each step to our case.

First our client which in our case is a Sveltekit app, will make a request to the server, requesting authentication. That will most likely happen when a user presses on the 'Login with Github' button.

Then our server sends back a link to Github's oauth page where the user will be asked to authorize our app to access their data. When the user authorizes our app, they will be redirected back to our
server with a code, that code is generated randomly by Github. 

We will then grab that code and exchange it against a Github token which we will use to query Github's API for the user data. The oauth flow ends there. What you do with the data is up to you and your
use case.

### Now let's build it
First we need to go to Github and register a new oauth application. Head over to your developer settings and create a new OAuth app. Here is how I filled the form

![create app](/create_app.png)

The Application name is up to you, the Homepage URL should be the home page of your app, in my case I put `http://localhost:5173` because my Sveltekit app is running on that port.
The description is also up to you. The callback URL is the link to where the user will be redirected after they authorize your app, so it needs to be an endpoint on your server, I put
`http://localhost:8080/auth/github/callback` because my Go server is listening on the port 8080 and I will write a handler for the endpoint `/auth/github/callback` to handle the authentication flow.

Now after your create your oauth, generate a new client secret and store it in a `.env` file at the root of your Go project.

```
GITHUB_CLIENT_ID="********************"
GITHUB_CLIENT_SECRET="*********************"
```
Remember to keep your client secret secure by removing the .env file from git index.

It is finally time to write some code
I will keep the code framework agnostic so I will be using Go's default http handler functions.

First we need an endpoint that will return a link to our oauth page.

```go
func RequestAuth(w http.ResponseWriter, r *http.Request) {
	oauthURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
		os.Getenv("GITHUB_CLIENT_ID"),
		os.Getenv("GITHUB_OAUTH_REDIRECT_URI"),
	)
	data, err := json.Marshal(
		map[string]string{
			"url": oauthURL,
		},
	)
	if err != nil {
		//log error
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
  w.Write(data)
  return
}
```
In this function we construct a URL that we send back to the client, that URL contains 3 parameters:
the client id that we got from Github, the redirect url that we set while creating our OAuth app and the scope. The scope defines the attributes that we want to be able to access on the user data.
I like to put the redirect URL in my environment variables because when we will be deploying to production we will have to change the Homepage URL and the callback URL also, so not hardcoding it is a 
good idea.

Now in our Sveltekit app we will make a dummy page with just a button that makes a request to the server to grab the URL and visits that URL if everything went well
```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	async function github_auth() {
		try {
			let response = await fetch(`http://localhost:8080/auth/request`);
			const { url } = (await response.json()) as { url: string };
			goto(url);
		} catch (err) {
			console.log(err);
		}
	}
</script>

<button on:click={github_auth}>
  <h1>Login with Github</h1>
</button>
```
If we click on the button on the frontend we are redirected to this page

![oauth page](/oauth_page.png)

At this point if we authorize the app we will get a 404 not found error because we haven't implemented the handler for the callback endpoint yet. So let's do that next

```go
func HandleAuthCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	error := r.URL.Query().Get("error")
	if error != "" {
		//Something went wrong
		if error == "access_denied" {
			//User denied access
		}
	}
	if code == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	accessToken, err := ExchangeCodeWithToken(code)
	data, err := GetUserGithubData(code)
	fmt.Printf("%v", data)
	return
}
```
Our handler will look like this. And you can see the flow in the code, first we get the code, and then if everything goes well we exchange the code with a token and we then use that token to get user data.
And then we just print the data.
I extracted logic into the `ExchangeCodeWithToken` and `GetUserGithubData` for readability. Let's look at what they are doing under the hood

First the `ExchangeCodeWithToken`
```go
func ExchangeCodeWithToken(code string) (string, error) {
	data := url.Values{}
	data.Set("client_id", os.Getenv("GITHUB_CLIENT_ID"))
	data.Set("client_secret", os.Getenv("GITHUB_CLIENT_SECRET"))
	data.Set("code", code)
	req, err := http.NewRequest(
		"POST",
		"https://github.com/login/oauth/access_token",
		bytes.NewBufferString(data.Encode()),
	)
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	respBodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}
	githubResponse := struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Scope       string `json:"scope"`
	}{}
    err = json.Unmarshal(
        respBodyBytes,
        &githubResponse,
    )
    if err!= nil{
        return "", err
    }
    return githubResponse.AccessToken, nil
}
```
What we are doing here is sending a HTTP request to Github's API to exchange the code we got against a token. First we create a `url.Values` struct, it is used for query parameters or form values,
you can read more about it in the docs. Then we construct a new POST request and we set the `Accept` header as `application/json` so that Github's API returns the data in a JSON format (it supports other formats as well)
Then we read the response body and unmarshal it into an anomymous struct. Finally we extract the token and return it.

That token will now be passed to the next function : `GetUserGithubData` which will use it to fetch the user data

```go
func GetUserGithubData(access_token string) (map[string]interface{}, error) {
	req, err := http.NewRequest(
		"GET",
		"https://api.github.com/user",
		nil,
	)
	if err != nil {
		return nil, err
	}
  req.Header.Set("Authorization", fmt.Sprintf("token %s", access_token))
  response, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
  respBodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
  data := map[string]interface{}{}
  err = json.Unmarshal(
    respBodyBytes,
    &data,
  )
	if err != nil {
		return nil, err
	}
  return data, nil
}
```

Here we use the access token to fetch user data and return it. The logic in the code is pretty much the same as the previous function, we construct a HTTP request, set a header and send the request. We then
read the body and unmarshal it into a `map[string]interface{}` I used that type and not a `map[string]string` because in the user data as we will see in a few seconds, some keys are not strings so we would
create a runtime error if we tried to explicitly cast them into strings.

Now let's go back to the client app and this time we will authorize the OAuth app and see what data is printed on the server.

Here is what we get:
```
map[
    avatar_url: https://avatars.githubusercontent.com/u/95161388?v=4
    bio: Software developer. Building things on the web and beyond.
    blog: https://thewisepigeon.tech
    company: <nil>
    created_at: 2021-11-28T07:05:50Z
    email: zozozozeph@gmail.com
    events_url: https://api.github.com/users/TheWisePigeon/events{/privacy}
    followers: 49
    followers_url: https://api.github.com/users/TheWisePigeon/followers
    following: 52
    following_url: https://api.github.com/users/TheWisePigeon/following{/other_user}
    gists_url: https://api.github.com/users/TheWisePigeon/gists{/gist_id}
    gravatar_id: 
    hireable: <nil>
    html_url: https://github.com/TheWisePigeon
    id: 9.5161388e+07
    location: Lomé, Togo
    login: TheWisePigeon
    name: TheWisePigeon
    node_id: U_kgDOBawMLA
    organizations_url: https://api.github.com/users/TheWisePigeon/orgs
    public_gists: 6
    public_repos: 84
    received_events_url: https://api.github.com/users/TheWisePigeon/received_events
    repos_url: https://api.github.com/users/TheWisePigeon/repos
    site_admin: false
    starred_url: https://api.github.com/users/TheWisePigeon/starred{/owner}{/repo}
    subscriptions_url: https://api.github.com/users/TheWisePigeon/subscriptions
    twitter_username: pigeondev0_0
    type: User
    updated_at: 2023-11-26T17:55:32Z
    url: https://api.github.com/users/TheWisePigeon
]
```
As you can see these are my public Github data. In the context of the app I am building, I would extract the email, the login and the avatar of the user and store them in my database but what you do with
the data can vary based on what you are building.

We could stop here but I wanted to show you something that made me want to pull my hair. Some users can have their email on private so it won't appear in the data returned by the API. As an example, I made
my email private and went through the oauth process again and this is what the API sent back as my data
```
map[
    avatar_url: https://avatars.githubusercontent.com/u/95161388?v=4
    bio: Software developer. Building things on the web and beyond.
    blog: https://thewisepigeon.tech
    company: <nil>
    created_at: 2021-11-28T07:05:50Z

    email: <nil>

    events_url: https://api.github.com/users/TheWisePigeon/events{/privacy}
    followers: 49
    followers_url: https://api.github.com/users/TheWisePigeon/followers
    following: 52
    following_url: https://api.github.com/users/TheWisePigeon/following{/other_user}
    gists_url: https://api.github.com/users/TheWisePigeon/gists{/gist_id}
    gravatar_id: 
    hireable: <nil>
    html_url: https://github.com/TheWisePigeon
    id: 9.5161388e+07
    location: Lomé, Togo
    login: TheWisePigeon
    name: TheWisePigeon
    node_id: U_kgDOBawMLA
    organizations_url: https://api.github.com/users/TheWisePigeon/orgs
    public_gists: 6
    public_repos: 84
    received_events_url: https://api.github.com/users/TheWisePigeon/received_events
    repos_url: https://api.github.com/users/TheWisePigeon/repos
    site_admin: false
    starred_url: https://api.github.com/users/TheWisePigeon/starred{/owner}{/repo}
    subscriptions_url: https://api.github.com/users/TheWisePigeon/subscriptions
    twitter_username: pigeondev0_0
    type: User
    updated_at: 2023-11-26T17:55:32Z
    url: https://api.github.com/users/TheWisePigeon
]
```
I put some space around the email to make it stand out, as you can see it is nil, even if you requested for the user email in the scope of your oauth app, the API will respect the fact that the user put it
on private and won't return it. The way you get access to the user's email now is by using the same access token to send another request to another endpoint of Github's API.

We can add this piece of code just below the one that fetches the user data 
```go
req, err = http.NewRequest(
    "GET",
    "https://api.github.com/user/emails",
    nil,
)
if err != nil {
    logger.Error(err)
    return nil, err
}
req.Header.Set("Authorization", fmt.Sprintf("token %s", access_token))
req.Header.Set("Accept", "application/json")
response, err = http.DefaultClient.Do(req)
if err != nil {
    logger.Error(err)
    return nil, err
}
respBodyBytes, err = io.ReadAll(response.Body)
if err != nil {
    logger.Error(err)
    return nil, err
}
println(string(respBodyBytes))
```
We are just printing the string representation of the response to see what it looks like. And the result is the following
```json
[
    {
        email: zozozozeph@gmail.com
        primary: true
        verified: true
        visibility: public
    },
    {
        email: 95161388+TheWisePigeon@users.noreply.github.com
        primary: false
        verified: true
        visibility: <nil>
    }
]
```
We can now from this, extract the desired email address and use it in our app logic.

### The end
If you made it this far, thank you for reading :) I hope you learned something new or that I helped clarify something for you. If you find an error in a code snippet or a mistake in my explanations,
please open an issue [here](https://github.com/TheWisePigeon/blogfolio/issues/new) and I will be happy to fix it. You can find all the code in this article on github in [Visio's repository](https://github.com/TheWisePigeon/visio)

Until next time, stay safe and write code. Pigeoff
