type AiEmail = {
  gmail_message: GoogleAppsScript.Gmail.GmailMessage;
  text: string;
  prompt?: string;
  reply?: string;
};
type AiEmailWithPrompt = AiEmail & {prompt: string}
type AiEmailWithReply = AiEmailWithPrompt & {reply: string}

function getConfig(key: "email_address"|"emails_search_string"|"emails_exclude_string"|"OPENAI_API_KEY"|"reply_prompt"|"replied_label"|"noreplyneeded_label"): string {
  const config_cells = {
    "email_address": "B2",
    "emails_search_string": "B3",
    "emails_exclude_string": "B4",
    "reply_prompt": "B5",
    "OPENAI_API_KEY": "B6",
    "replied_label": "B7",
    "noreplyneeded_label": "B8",
  }

  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONFIG")?.getRange(config_cells[key])?.getValues()[0][0];
}

/**
 *
 * Get the messages from Gmail.
 * Assumption:
 *  - users will know the right search terms
 *  - replies will only be drafted on the last email of the thread
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function getEmails(maxThreads: number = 20): GoogleAppsScript.Gmail.GmailMessage[] {
  const searchString = getConfig("emails_search_string") + ' ' + getConfig("emails_exclude_string");
  let threads = GmailApp.search(searchString, 0, maxThreads);
  let emails: GoogleAppsScript.Gmail.GmailMessage[] = threads.flatMap(
      thread => thread.getMessages()[thread.getMessageCount() - 1]
    );

  return emails;
}

/**
 *
 * Adds some context to an email plain body by adding FROM, TO and SUBJECT at the top
 * Note: email content is sliced to avoid the 50,000 character limit of google Sheet
 * 
 * @author fabriceb
 * @date 2023-12-25
*/
function extractTextFromEmail(email: GoogleAppsScript.Gmail.GmailMessage): AiEmail {
  let from = email.getFrom();
  let to = email.getTo();
  let subject = email.getSubject();
  let body = email.getPlainBody();
  let text = `FROM: ${from}
TO: ${to}
SUBJECT: ${subject}
${body.substring(0, 48000)}`;

  return {
    gmail_message: email,
    text: text
  };
}

/**
 *
 * Combines prompt and email text
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function getPromptAndEmailText(email_text: string): string {
  const reply_prompt: string = getConfig("reply_prompt");
  
  return `${reply_prompt}
${email_text}`;
}

/**
 *
 * Adds prompt to an email
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function addReplyPrompt(email: AiEmail): AiEmailWithPrompt {
  
  return {
    gmail_message: email.gmail_message,
    text: email.text,
    prompt: getPromptAndEmailText(email.text)
  };
}

/**
 *
 * Adds reply to an email
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function addReply(email: AiEmailWithPrompt): AiEmailWithReply {
  
  return {
    gmail_message: email.gmail_message,
    text: email.text,
    prompt: email.prompt,
    reply: callOpenAI(email.prompt)
  };
}

/**
 * 
 * Calls OpenAI API to generate a reply
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function callOpenAI(prompt: string): string {
  const OPENAI_API_KEY: string = getConfig("OPENAI_API_KEY");
  
  const model = 'gpt-4-1106-preview'; // Choose the appropriate engine for your needs
  
  const url = 'https://api.openai.com/v1/chat/completions';  // Chat completions endpoint

  const payload = {
    model: model,
    messages: [
      // Previous messages in the conversation (if any)
      // {"role": "system", "content": "Your system message"},
      {"role": "user", "content": prompt}
    ],
    max_tokens: 150
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(payload),
    'headers': {
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const json = response.getContentText();
  const data = JSON.parse(json);

  Logger.log(data.choices[0].message.content);  // Log the chat completion
  return data.choices[0].message.content;       // Return the chat completion
}

/**
 *
 * Helper function to put data in a column in the REPLIES sheet
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function writeInSpreadsheetColumn(data_list: any[], extractFunction: Function, column: number) {
  if (data_list.length == 0) {
    return;
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("REPLIES");
  if (!sheet) {
    return;
  }

  // Prepare the data as a 2D array (even if it's just one column)
  const data: string[][] = data_list.map(data => [extractFunction(data)]);
  const range = sheet.getRange(2, column, data.length, data[0].length);
  range.setValues(data);
}

/**
 * 
 * Converts plain text to HTML, written by ChatGPT4
 * 
 * @author ChatGPT4 + fabriceb
 * @date 2024-01-09
 */
function textToHtml(text: string): string {
  // Replace special HTML characters with their corresponding HTML entities
  const htmlText = text
      .replace(/&/g, '&amp;')  // Ampersand
      .replace(/</g, '&lt;')   // Less than
      .replace(/>/g, '&gt;')   // Greater than
      .replace(/"/g, '&quot;') // Double quotes
      .replace(/'/g, '&#039;') // Single quote
      .replace(/\n/g, '<br>'); // Replace newline characters with HTML line breaks

  return htmlText;
}

/** 
 * 
 * creates the reply object in both plain text and HTML with signature
 * Requires adding this dependency in appsscript.json
  
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Gmail",
        "version": "v1",
        "serviceId": "gmail"
      }
    ]
  },
  
 * @author fabriceb
 * @date 2023-01-08
 */
function convertToHtmlReply(reply_text: string): string
{
  const signature: string | undefined = Gmail.Users.Settings.SendAs.get("me", getConfig("email_address")).signature;
  return textToHtml(reply_text) + "<br>" + signature;
}

/**
 * 
 * remove superfluous "from" email address from the cc list
 * to counter a weird behaviour in createDraftReplyAll
 * 
 * @author fabriceb
 * @date 2023-01-08
 */
function cleanCcList(draft: GoogleAppsScript.Gmail.GmailDraft): GoogleAppsScript.Gmail.GmailDraft {
  
  // There is a weird behaviour in createDraftReplyAll that automatically 
  // adds yourself to the CC list.
  // So we are removing it here
  let ccList = draft.getMessage().getCc().split(",");
  let getFrom = draft.getMessage().getFrom();
  ccList = ccList.filter(email_address => !email_address.includes(getFrom));

  return draft.update(
    draft.getMessage().getTo(), // Preserve the "To" recipients
    draft.getMessage().getSubject(), // Preserve the subject
    draft.getMessage().getPlainBody(), // Preserve the body
    {
      "htmlBody": draft.getMessage().getBody(), // Preserve the HTML body
      "cc": ccList.join(","), // Updated "CC" recipients
    }
  );
}

/**
 * 
 * create the draft reply in Gmail based on the reply generated by OpenAI
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function createDraftReplyInGmail(email: AiEmailWithReply): void {
  let label: GoogleAppsScript.Gmail.GmailLabel = GmailApp.getUserLabelByName(getConfig("noreplyneeded_label"));
  if (email.reply !== "NO REPLY NEEDED") {
    let draft = email.gmail_message.createDraftReplyAll(
      email.reply,
      {
        "htmlBody": convertToHtmlReply(email.reply),
      }
    );
    cleanCcList(draft);
    
    label = GmailApp.getUserLabelByName(getConfig("replied_label"));
  }
  label.addToThread(email.gmail_message.getThread());
}

/**
 *
 * 1. Downloads the last unread emails
 * 2. Puts them in the spreadsheet
 * 3. Creates the prompt to generate replies
 * 4. Generates replies
 * 5. Puts them in the spreadsheet
 * 
 * @author fabriceb
 * @date 2023-12-25
 */
function writeEmailRepliesToSheet(): void {

  // get last unread emails
  const emails = getEmails();
  const ai_mails: AiEmail[] = emails.map(extractTextFromEmail);

  const ai_mails_with_prompt: AiEmailWithPrompt[] = ai_mails.map(addReplyPrompt);
  writeInSpreadsheetColumn(ai_mails_with_prompt, ai_mail => ai_mail.text, 1);

  const ai_mails_with_replies: AiEmailWithReply[] = ai_mails_with_prompt.map(addReply);
  writeInSpreadsheetColumn(ai_mails_with_replies, ai_mail => ai_mail.reply, 2);
  
  // generated the draf replies in Gmail
  ai_mails_with_replies.map(createDraftReplyInGmail);
}

/*
*
* 1. Reads the content of the active cell
 * @author fabriceb
 * @date 2023-12-25
 * 2. Uses callOpenAI to get a reply
 * 3. Puts the reply in the right cell
 */
function writeReplyToSheet(): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const cell = sheet.getActiveCell();
  const prompt = getPromptAndEmailText(cell.getValue());
  const reply = callOpenAI(prompt);
  sheet.getRange(cell.getRow(), cell.getColumn() + 1).setValue(reply);
}


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('GmailAiREplier')
    .addItem('Download last 10 email threads', 'writeEmailRepliesToSheet')
    .addItem('Reply to the current email', 'writeReplyToSheet')
    .addToUi();
}
