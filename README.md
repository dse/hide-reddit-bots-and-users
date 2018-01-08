# Hide Reddit Bots and Users

Browser extension (Chrome initially) to hide specific Reddit bots and/or users

## Why I Created This Extension

I developed this extension to hide comments from certain rather
verbose bots whose long posts I didn't want to have to slog through
while scrolling down through comments.

## What This Extension Actually Does

You can use this to hide comments from certain non-bot users as well.
This extension does not differentiate between bots and human users.

It only hides the text of their comments, as well as "reply" and other
buttons other than "show author".  It doesn't collapse threads, so you
will still see replies to the bots or users you are ignoring.

The list of users whose comments are hidden is synced with your Google
account.  If you're not logged into a Google account or you have
syncing disabled, it uses local storage because in that situation,
`chrome.storage.sync` behaves identially to `chrome.storage.local`.

## TODO

- Finish the popup: get it to show the hide list and be able to clear
  it out or remove an individual bot or user from it.

- On reddit pages, use mutation observer to add show/hide links to
  additional comments when someone clicks "load more comments".  To
  see if anything needs updates, cache a list of comment IDs?

- On reddit pages, use storage observer to update hide/show states
  when the popup is used to update the hide list.
