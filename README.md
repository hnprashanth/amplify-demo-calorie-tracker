Aim of this project is to teach absolute beginners on how to add Amplify backend to their frontend project. This project is built with React and completely relies on local state for data. We convert this app step by step to store data on DynamoDB by calling REST APIs. We will also add authentication and learn how to store some user information in Cognito.

## Prerequisites

- Your computer must have node, npm & git installed.
- Amplify CLI installed and configured, Link: https://github.com/aws-amplify/amplify-cli

### Getting Started

Clone this repository and change to it

`git clone git@github.com:hnprashanth/amplify-demo-calorie-tracker.git`
`cd amplify-demo-calorie-tracker`

Install dependencies
`npm install`

Run
`npm run start`

Visit http://localhost:3000

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

- id
- food_name
- calories
- created_at

I'll be using id as partition key & created_at as sort key for my table. So let's go ahead and continue with the wizard:

- What would you like to name this column - id, select type: String
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
 
Login to AWS console to see all the resources available to use with your app. In the menu, click "Services" and select API Gateway, you will see API Gateway with your given name listed here. Click on your API and it opens detail page of that API. In the navigation breadcrump, there will be a random string in bracet like cal-track (h59hb2nhr7), note down this string "h59hb2nhr7", we will need that to call this API from our app.
