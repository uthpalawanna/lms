# SHRI LMS Backend — Beginner Setup Guide

This is a real, working backend for your SHRI LMS. It currently supports
**register** and **login** — everything else (courses, quizzes, etc.) will
be added the same way, one piece at a time.

---

## What you need installed on your computer

1. **Node.js** — https://nodejs.org (install the LTS version)
   - Check it worked: open a terminal and run `node -v`
2. **A code editor** — you likely already use VS Code
3. **A MongoDB database** — we'll use a free cloud one (no local install needed)

---

## Step 1 — Create a free MongoDB database

1. Go to https://www.mongodb.com/cloud/atlas/register and make a free account
2. Create a free "M0" cluster (takes a couple of minutes to spin up)
3. Click "Database Access" → add a new database user (pick a username + password, save them somewhere)
4. Click "Network Access" → "Add IP Address" → choose "Allow access from anywhere" (fine for development)
5. Click "Connect" on your cluster → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `<username>` and `<password>` with the ones you created, and add a database name at the end, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/shri-lms
   ```

Keep this string handy — you'll paste it into `.env` in Step 3.

---

## Step 2 — Install the project dependencies

1. Unzip this project folder somewhere on your computer
2. Open a terminal **inside the `shri-backend` folder**
3. Run:
   ```bash
   npm install
   ```
   This downloads all the packages listed in `package.json` (Express, Mongoose, etc.) into a `node_modules` folder.

---

## Step 3 — Set up your environment variables

1. In the `shri-backend` folder, make a copy of `.env.example` and rename the copy to `.env`
2. Open `.env` and paste in your real MongoDB connection string from Step 1
3. You can leave `JWT_SECRET` and `PORT` as they are, or change `JWT_SECRET` to any random string of your own

Your `.env` should look something like:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/shri-lms
JWT_SECRET=change_this_to_a_long_random_string_12345
PORT=5000
```

**Important:** never upload your real `.env` file to GitHub — it contains your database password.

---

## Step 4 — Run the server

```bash
npm run dev
```

If everything worked, you should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

If you see an error instead, it's almost always one of:
- Wrong password in `MONGO_URI`
- Forgot to allow network access in Atlas (Step 1.4)
- Forgot to run `npm install` first

---

## Step 5 — Test it actually works

You need a tool to send test requests (since you don't have the frontend wired up to it yet). Two easy free options:

- **Postman** (https://www.postman.com/downloads/) — most popular
- **Thunder Client** — a VS Code extension, lighter weight

### Test registering a user

Send a `POST` request to:
```
http://localhost:5000/api/auth/register
```
With this JSON body:
```json
{
  "firstName": "Kapila",
  "lastName": "Perera",
  "username": "dineshan",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}
```

If it works, you'll get back a response with a `token` and a `user` object. That means your user was saved in MongoDB!

### Test logging in

Send a `POST` request to:
```
http://localhost:5000/api/auth/login
```
With this JSON body:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

You should get the same kind of response back — a token proving you're logged in.

---

## What's next?

Once register/login work for you, tell Claude and we'll:
1. Connect your React `login.jsx` to actually call this backend (instead of the fake `alert()` logic)
2. Add the **Course** model + routes the same way
3. Keep going through Enrollments, Announcements, Quiz Attempts, Withdrawals, Reviews, Wishlist, Orders, and Q&A — one at a time, same pattern every time

You don't need to memorize any of this right now — just get through Steps 1–5 above, and we'll build the rest together piece by piece.
