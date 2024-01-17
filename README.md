GMail AI Replier
================

What if AI could draft replies to all your emails, so all you have to do is skim through your drafts, make some changes, and click send? This is what this project aims to do.

## How it works

It is a Google Sheets script that 
1. uses the Gmail API to fetch your emails
2. then uses the [GPT-4](https://openai.com/blog/better-language-models/) language model to draft replies to your emails. 
3. finally sues the GMail API to save the replies as drafts in Gmail, so you can review them and send them.

## How to use it (non-dev version)

1. You need an OpenAI API key. You can get one [here](https://beta.openai.com/).
2. Duplicate [this Google Sheet](https://docs.google.com/spreadsheets/d/1K7dXsf0eZK3O8Mu1ptlAjM7jpmUowUbhdLeqY9GhGdA/edit#gid=0) and configure
 - your OpenAI API key
 - your email address
 - your prompt.
3. Click a first-time on "Download last 10 email threads" to trigger all the authorization requests allowing your Google Sheet to access your Gmail account
4. And you should be done!

## How to use it (dev version)

1. You need an OpenAI API key. You can get one [here](https://beta.openai.com/).
2. git clone this repository
3. npm install should install clasp
4. clasp login, clasp push, clasp deploy, clasp open
3. Click a first-time on "Download last 10 email threads" to trigger all the authorization requests allowing your Google Sheet to access your Gmail account
4. And you should be done!