GMail AI Replier
================

What if AI could draft replies to all your emails, so all you have to do is skim through your drafts, make some changes, and click send? This is what this Google Sheet does for you, if you use Google Mail.

## How it works

The Google Sheets script 
1. fetches your emails using the built-in Gmail API
2. then uses the [GPT-4](https://openai.com/blog/better-language-models/) language model API to draft replies. 
3. and saves the replies as drafts in your GMail account, so you can review them before sending them.

## How to use it (non-dev version)

https://github.com/fabriceb/GMailAIReplier/assets/227429/8270ed6d-3e49-4e67-b454-fa9c7e1aa8dc

You can watch the video tutorial or follow the following steps:

1. You need an OpenAI API key, which you can get [here](https://platform.openai.com/api-keys).
2. You then duplicate [this Google Sheet](https://docs.google.com/spreadsheets/d/1K7dXsf0eZK3O8Mu1ptlAjM7jpmUowUbhdLeqY9GhGdA/edit#gid=1457571043) to your Google account and configure
 - your OpenAI API key
 - your email address
 - your prompt.
3. Click a first-time on "Download last 10 email threads" to trigger all the authorization requests allowing your Google Sheet to access your Gmail account
4. Click a second time on "Download last 10 email threads" to check it actually works
4. Last but not least, automate it with a trigger.
    - In the Google Sheets, click on "Extensions" > "Apps Script"
    - In the left menu, click on "Triggers" (the small alarm clock icon)
    - Click on "Add trigger" (bottom right corner)
    - Select "writeEmailRepliesToSheet" as the function to run
    - Select "Time-driven" as the event source
    - Select "Hour timer" or "Minutes timer" as the type of time based trigger
    - Click on "Save"
    - Say yes to the new auhtorization request
5. Enjoy!

## How to use it (dev version)

1. git clone this repository
2. npm install
3. clasp login, clasp push, clasp deploy, clasp open
4. Make the empty Google Sheet look like [this Google Sheet](https://docs.google.com/spreadsheets/d/1K7dXsf0eZK3O8Mu1ptlAjM7jpmUowUbhdLeqY9GhGdA/edit#gid=1457571043)
