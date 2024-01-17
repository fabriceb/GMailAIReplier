GMail AI Replier
================

What if AI could draft replies to all your emails, so all you have to do is skim through your drafts, make some changes, and click send? This is what this project aims to do.

## How it works

It is a Google Sheets script that 
1. uses the Gmail API to fetch your emails
2. then uses the [GPT-4](https://openai.com/blog/better-language-models/) language model to draft replies to your emails. 
3. finally sues the GMail API to save the replies as drafts in Gmail, so you can review them and send them.

## How to use it (non-dev version)

1. You need an OpenAI API key. You can get one [here](https://platform.openai.com/api-keys).
2. Duplicate [this Google Sheet](https://docs.google.com/spreadsheets/d/1K7dXsf0eZK3O8Mu1ptlAjM7jpmUowUbhdLeqY9GhGdA/edit#gid=1457571043) and configure
 - your OpenAI API key
 - your email address
 - your prompt.
3. Click a first-time on "Download last 10 email threads" to trigger all the authorization requests allowing your Google Sheet to access your Gmail account
4. Last but not least, automate it.
    - In the Google Sheets, click on "Extensions" > "Apps Script"
    - In the left menu, click on "Triggers" (the small alarm clock icon)
    - Click on "Add trigger" (bottom right corner)
    - Select "writeEmailRepliesToSheet" as the function to run
    - Select "Time-driven" as the event source
    - Select "Hour timer" or "Minutes timer" as the type of time based trigger
    - Click on "Save"
5. And you should be done!

## How to use it (dev version)

1. You need an OpenAI API key. You can get one [here](https://platform.openai.com/api-keys).
2. git clone this repository
3. npm install
4. clasp login, clasp push, clasp deploy, clasp open
5. Make the empty Google Sheet look like [this Google Sheet](https://docs.google.com/spreadsheets/d/1K7dXsf0eZK3O8Mu1ptlAjM7jpmUowUbhdLeqY9GhGdA/edit#gid=1457571043)
6. Execute step 3 and 4 of the non-dev version