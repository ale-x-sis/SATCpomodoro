# Carrie’s Column Timer — V1

This is the finishable V1.

## What works

- Focus Mode opens first.
- Start / Pause / Reset control a 25-minute timer.
- Timer reaching 0 switches the app into Break Mode.
- Break Mode hides the timer section and shows the activity card.
- Reveal Break Activity manually switches to Break Mode.
- New Activity cycles through the activity data.
- Back to Focus resets the timer and returns to Focus Mode.
- Columns Filed increments only when the timer reaches 0.

## Files

- `index.html` = page structure
- `style.css` = styling
- `src/satcActivities.js` = activity data
- `src/main.js` = app behavior

## Preview

Because this uses JavaScript modules, preview it with a local server.

Option 1: VS Code Live Server

Right-click `index.html` → Open with Live Server.

Option 2: Terminal

```bash
cd SATCpomodoro_V1
python3 -m http.server 5173
```

Then open:

```txt
http://localhost:5173
```

## Easy tweak for testing

In `src/main.js`, change this:

```js
const FOCUS_SECONDS = 25 * 60;
```

to this:

```js
const FOCUS_SECONDS = 10;
```

That makes the timer run for 10 seconds so you can test completion without waiting 25 minutes.
