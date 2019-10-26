Aim of this project is to teach absolute beginners on how to add Amplify backend to their frontend project. This project is built with React and completely relies on local state for data. We convert this app step by step to store data on DynamoDB by calling REST APIs. We will also add authentication and learn how to store some user information in Cognito.

## Prerequisites

- Your computer must have node, npm & git installed.
- Amplify CLI installed and configured, Link: https://github.com/aws-amplify/amplify-cli

### Getting Started

Clone this repository and change to it

`git clone git@github.com:hnprashanth/amplify-demo-calorie-tracker.git`<br/>
`cd amplify-demo-calorie-tracker`

Install dependencies
`npm install`

Run
`npm run start`

Visit http://localhost:3000

You will calorie tracker app functioning using data purey from local state. Refresh & all the data you entered is lost.

### Add Amplify backend

Initialise your project with Amplify

`amplify init`

- Give your project a name
- Name your environment, ex: dev, prod
- Choose your editor
- Choose "Javascript" for type of app & select all other auto-detected options, React, build directory etc.
- For "Do you want to use an AWS profile?" If you have multiple AWS profiles, say "Y" and select profile of your choice

Amplify will take few seconds to initialise this project on cloud. Once done, we are ready to add more capabalities to our project!

#### Add API & Auth

Let's add API which is restricted to only Authenticated users, since our app has no use for unauthenticated users.

`amplify add api`

- Select REST
- Give your project name so that you can easily track resources in AWS
- Provide path, you can use default path of "/items" or use your own, in this case it can be "/entries", I'll stick to default here since I don't intent to grow this project and add more paths.
- Choose "Create New Lambda Function" and give it a label
- Give a name for your function
- Choose "CRUD Functions" option since we want the ability to add, read and delete entries. We will not be using update in this project, but good to have it if you want to extend the project to allow edits in entries.
- Create New DynamoDB table & give it a label - since we don't have an exisiting table already.
- Give your table a name

Now we get into a wizard where we tell dynamodb what columns of what type we need for our application. It is not required to configure all our fields through this wizard since it's a NoSQL store & isn't strict about schema. However, it stricly cares about defining Partition Key & Sort Key (optional). Following are the fields which we are using in our app:

- user_id
- food_name
- calories
- created_at

I'll be using id as partition key & created_at as sort key for my table. So let's go ahead and continue with the wizard:

- What would you like to name this column - user_id, select type: String
- Would you like to add another column? - Y
- What would you like to name this column - created_at, select type: Number
- Would you like to add another column? - N
- Please choose partition key for the table - id
- Do you want to add a sort key to your table? - Y
- Please choose sort key for the table: created_at
- Do you want to add global secondary indexes to your table? - N
- Do you want to edit the local lambda function now? - N
- Restrict API access - Y

By selecting Y we are telling amplify that we want to restrict to API to authenticated users only. Amplify detects that we haven't added auth to our project yet and starts a wizard to do the same:

- Who should have access? - Authenticated users only
- What kind of access do you want for Authenticated users - read/write
- Do you want to add another path? - N

With all these options we chose, amplify has created configuration files to create these resources locally. Which means as of now, these resources aren't created in cloud (AWS) yet. You can check these configuration files at "amplify" directory of your project.

_it's unimportant to know, but if you are curious, amplify generated Cloudformation template locally based on choices we made though wizard. When we do amplify push as noted below, it pushes this cloudformation tamplate to AWS and cloudformation brings all resources as we requested_

To create thses resources on cloud, we need to run

`amplify push`

Are you sure you want to continue? - Y

It will take few minutes to bring up all resources and configure them with each other as we desired. With minimal effort, we will now have API Gatweay configured to talk to Lambda which inturn talks to DynamoDB to get/put data we neeed. Plus, it will also allow API calls only if it authenticated/authorized.

Login to AWS console to see all the resources available to use with your app. In the menu, click "Services" and select API Gateway, you will see API Gateway with your given name listed here. Click on your API and it opens detail page of that API. In the navigation breadcrump, there will be the name of your API like cal-track, note down this string, we will need that to call this API from our app.

### Add Amplify Library to our project!

So far we have used Amplify CLI to easly create and configures resources required for our project. To put these resources to use we can take advantage of Amplfy JS library. Let's add it to our project:

`npm install aws-amplify aws-amplify-react --save`

aws-amplify is the JS library which will provide us with bunch of easy to use functionalities. aws-amplify-react gives us some of the ready to use React components, for example: Signup, Signin pages with all error handling and input field validations.

#### Initialize Amplify

Add following imports to 'src/App.js' at the top after React import statement

```javascript
import Amplify from "aws-amplify";
import awsmobile from "./aws-exports";
import { withAuthenticator } from "aws-amplify-react";
```

And right below it

```javascript
Amplify.configure(awsmobile);
```

If you are wondering where did this aws-exports came from, it is auto-generated by ampliy filled with all the credentials required to use our resources. With this we are now ready to talk to our API and store data there. But if you remember, we asked Amplify to restrict access to Authenticated users only. We need to make sure user is logged in before he/she tries to log calories. Amplify provides us with higher order function withAuthenticator for the same purpose. Let's put that to use by wrapping our "App" component with it at the bottom of the file

```javascript
export default withAuthenticator(App);
```

Start your app with `npm run start` and visit http://localhost:3000 and you can see it no longer loads our App and instead asks us to signup/signin. Note that this is fully functional page with error handling, input validations provided to use by Amplify React library.

#### Get Current User

Let's add "Auth" our import statement first

```javascript
import Amplify, { Auth } from "aws-amplify";
```

Create a function which can get currently logged in user and store it in state

```javascript
  getCurrentUser() {
    Auth.currentAuthenticatedUser().then(user => {
      this.setState({
        user
      });
    });
  }
```

You can check your state for returned user object which can be used in our app now. Make sure that getCurrentUser() is called as soon as page is loaded by adding this:

```javascript
componentDidMount() {
  getCurrentUser()
}
```

#### Call API

Let's change our Amplify import statement to have access to API

```javascript
import Amplify, { Auth, API } from "aws-amplify";
```

#### Add Entry

First let's start storing our entries in DynamoDB by calling POST on our API. Documentation - https://aws-amplify.github.io/docs/js/api#post

Let's update our logCalories function with code to call API

```javascript
logCalories = e => {
  e.preventDefault();
  const { food_name, calories } = this.state;
  let apiName = "api-name"; //replace with your API name copied from API Gateway page
  let path = "/items";
  let data = {
    body: {
      user_id: this.state.user.attributes.sub,
      food_name,
      calories,
      created_at: Date.now()
    }
  };
  API.post(apiName, path, data)
    .then(response => {
      this.setState({
        entries: [
          ...this.state.entries,
          {
            id: this.state.user.attributes.sub,
            food_name,
            calories,
            created_at: Date.now()
          }
        ],
        food_name: "",
        calories: 0
      });
    })
    .catch(error => {
      console.log(error.response);
    });
};
```

Assuming you already created an account and logged in, try adding a new entry now. It will take little longer than it was before to update the UI because it is now sending it over to API. You can open AWS Console and open DynamoDB table and see if entries are getting created.

#### Get Entries

While we have added some entries and it is all stored in our backend, our app is still loading data from local state. Let's get entries from API and provide it to our app. I'll start with removing dummy data I had initialised in my local state, change the state at the beginning of your component to this:

```javascript
state = {
  food_name: "",
  calories: 0,
  entries: [],
  calorie_limit: 1800
};
```

Only difference is that entries now is an empty array which before had a dummy entry.

Now let's add a new function to get entries from API and make it available to our app. Documentation - https://aws-amplify.github.io/docs/js/api#get

```javascript
  getEntries() {
    let path = "/items/" + this.state.user.attributes.sub;
    const apiName = "api-name"
    API.get(apiName, path)
      .then(response => {
        this.setState({ entries: response });
      })
      .catch(error => {
        console.log(error);
      });
  }
```

We need to call getEntries() as soon as page is loaded but need to wait until we have current user object. So, let's chain getEntries .then of getCurrentUser by updating that function

```javascript
  getCurrentUser() {
    Auth.currentAuthenticatedUser({ bypassCache: true }).then(user => {
      this.setState({
        user
      });
      this.getEntries();
    });
  }
```

Now when you see the app in localhost, it should start listing enries logged by you before. You can add more entries and refresh the page to see if it persists.

#### Delete Entry

Update the deleteEntry function perform deltetion through API instead of just on local state, documentation - https://aws-amplify.github.io/docs/js/api#delete

```javascript
deleteEntry = entry => {
  let path = `/items/object/${entry.user_id}/${entry.created_at}`;
  const apiName = "api-name";
  API.del(apiName, path)
    .then(response => {
      console.log(response);
      const new_entries = this.state.entries.filter(
        item => item.food_name !== entry.food_name
      );
      this.setState({ entries: new_entries });
    })
    .catch(error => {
      console.log(error.response);
    });
};
```

#### Add Custom Attribute to Cognito

In our app we have "Daily Calorie Limit" set to 1800 calories and we let user to edit this field. Like all our other data, this is not persisted and resets to 1800 on refresh losing edits. Cognito allows us to store such user related information and gives it to us when get current user. First goto Cognito, select your user pool, attributes, click "Add Attribute" at the bottom, select type as number, give name as "calorie_limit", increase max-value to 5000 & add. Add changeLimit function to update this data to cognito:

```javascript
changeLimit = () => {
  Auth.updateUserAttributes(this.state.user, {
    "custom:calorie_limit": this.state.calorie_limit
  });
  this.setState({ limit_edit: false });
};
```

Change button accordingly

```html
<button onClick="{this.changeLimit}">
  Done
</button>
```

We also need to modify getCurrentUser() function so that this attribute is readily available by disabling cache.

```javascript
  getCurrentUser() {
   Auth.currentAuthenticatedUser({ bypassCache: true }).then(user => {
     console.log(user);
     this.setState({
       user,
       calorie_limit: user.attributes["custom:calorie_limit"]
     });
     this.getEntries();
   });
 }
```

#### Logout

Now that we have added all the functionalities, let's finish by implementing logout

```javascript
signOut = () => {
  Auth.signOut();
};
```

```html
<a href="/" onClick="{this.signOut}">
  Logout
</a>
```
