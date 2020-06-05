Firefrost 

Firefrost is a free tool for developers using Firebase Cloudstore to create Dashboards and share it with their team or customers. Developers can write Firebase Cloudstore queries to fetch data, describe the data and save it to the dashboard. The dashboard link can then be shared with their team or customers, who can access it by logging in with their credentials. 

All the queries and user data will be stored and fetched from your Firebase account.

Installation 
------------

1. Clone this project from Github 
2. fetch the Firebase config file from your Firebase account (Json file)
3. copy the config file to the src folder (file name must be firebase-config.json)
4. Deploy it to your Firebase hosting with "firebase deploy --project <your_project_id>"

Firebase Admin Account
----------------------

Create a Firebase Authentication account (email/password account), which will act as the admin account, from the Firebase console. Ensure that the email is verified and account is active.

Open the link in your browser. You will be asked for the admin account credentials, which was created above. 

Firebase User Accounts
----------------------

You can add users from the user management section of Firefrost. You have to create these users on the Firebase Authentication, before adding them here. You can also use existing users with email/password authentication. 

After creating the user in Firebase Authentication, you add a user with role as "User", they can access only the dashboard and cannot create any queries. If you want to add other teammates, add them with "admin" role. All admins can save queries. 


Writing Queries 
---------------

You can write, execute and save queries from the home page. Queries are provided with firebase DB instance in the form of "this.db". You can write the query starting from this and it must return a promise, which resolves to a firebase result. 

Ex: this.db.collections("users").where("role", "==", "admin").orderBy("registered_date", "desc").limit(100).get()

If your queries returns large amount of data, then donot forget to include a "limit" in your query, to prevent long fetching time issues. 

Saving Queries 
--------------

Save your queries with a descrption understandable to others. The queries are saved in a separate collection in your Firebase cloudstore. 

Sharing the dashboard 
---------------------

You can share the domain name of the Firebase Hosting that was created when you deployed it, Or you can also connect a custom domain and share that with customers. Ensure the following

1. Ensure that you have added the customer account into Firebase Authentication before sharing. The customer will use this credentials to login.
2. Ensure that you have added the user from Firefrost user management.

When the customer logs in with his credential, he can only see the dashboard part, which doesn't allow him to save queries. 
