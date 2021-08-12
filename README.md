# BAF Badges

> Note: This section assumes you're a BAF team member and is written with a less-experienced albeit smart college student in mind, so it's more pedantic and assumes you're a part of BAF. If you're not a part of BAF, you should [become one](https://thebafnetwork.typeform.com/to/jes7CS).

BAF badges aims to be an all-in one credentialing service that's analogous to the combination of a resume and transcript. It provides a way for teachers, employers, and others to mint NFT's signifying "everything you'd put in a resume". This might enclude educational credentials, badges that proved you worked at a certain place and completed a certain job, badges that prove someone held a particular leadership position, or really anything else you'd put on a resume.

This project is written as a [Dapp] on [Near Protocol](). It uses [React](https://reactjs.org/) and [Next.js](https://nextjs.org/) for the UI and [Fleek](https://fleek.co/) for storage.

We use [TypeScript](https://www.typescriptlang.org/). Vanilla JavaScript is not allowed in this repo. If you're unfamiliar with typescript, know that any JavaScript is valid typescript, so you'll only need to learn how to use / add types.

## Development

You'll need to be added to the team on vercel. Please reach out to a BAF team member for that.

### Prerequisites

1. You'll need to be running a UNIX-like operating system - either Mac or Linux. We do not support developing on windows.
> If you use windows, [set up Windows Subsystem for Linux (WSL)](https://www.youtube.com/watch?v=-atblwgc63E). I promise you all of your development work moving forward, not just this, will be far less painful with WSL.
2. You'll need nodejs installed. If you haven't installed it yet, I hihgly reccomend avoiding the downloads on `nodejs.org` like the corona and [install nvm](https://github.com/nvm-sh/nvm#installing-and-updating) instead.
3. You'll need `yarn` installed. Luckily this is as simple as `npm install -g yarn`.

### Getting set up

After you've cloned the repo, you'll need to login with the vercel CLI and link your local copy of the project to vercel. You'll only need to do this once. It provides us with a somewhat secure but very painless way of disseminating dev-mode API keys and stuff like that. Here's how to do it:

1. install the `vercel` CLI if you haven't already with `npm i -g vercel`
2. Once the `vercel` CLI is installed, run `vercel login`. This will open your browser and sign you into your vercel account in the CLI.
3. Now that you're authenticated, run `vercel link`. This will link your local copy of the project to vercel so vercel knows it's OK to send the API keys to you.
4. Now that you're authenticated, run `vercel env pull`. This will download a file called `.env` and put it at the root of the repository. 

> Note: in the future, we would add people to the fleek team and have everyone manage their own API keys and env variables. But rn fleek teams are a massive pain to manage, their console is super buggy, and I (the maintainer) don't want to deal with that right now.

### Running it locally

Make sure your dependencies are installed (`node_modules` directory). If they aren't, install them with `yarn install`

Then, all you have to do is

```bash
yarn dev
```

This will do three things:
1. compile the contract
2. deploy the contract to the NEAR testnet
3. make the API routes (serverless functions) (defined in `pages/api`) available at [http://localhost:3000/api/](http://localhost:3000/api/).
3. serve the frontend on a local development server at [http://localhost:3000](http://localhost:3000).

> This script is defined in the `scripts` property of `package.json` - feel free to look at it and see what `yarn dev` actually does under the hood.

Once it's running, open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

The server automatically reloads the UI code whenever you change a file and save it, so keep this running in the background while you do your work.

### Usage of Git

There are plenty of resources about this online, and you can always ask us for help. That said, here are a few things to always keep in mind:

1. Whenver you open up the project and start working, checkout main and do a `git pull` to make sure your local copy is up to date with any changes that other team members might have made since the last time you pulled.
2. Whenver you're working on something, always create a new branch called `[short-version-of-name]/[thing-you're working on] **before** you change anything. Doing it later makes things kind of a headache.
3. Try to split up your work into smaller commits and always give helpful commit messages like "add [function-name]" or "fix [very short bug description]".

## Various Docs / Resources you should refer to before asking for help

Many of us are busy, and learning how to figure stuff out on your own using docs is a really good skill. So if you're struggling, please check one of the following places for answers / things that might lead to an answer:


- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - interactive Next.js tutorials.
- [NEAR Docs](https://docs.near.org/docs/develop/basics/getting-started) - this site is kind of a mess, but spend some time searching and you'll probably find something at least helpful
- [`near-api-js` typedocs](https://near.github.io/near-api-js/index.html) - extensive documentation of all of the types, classes, functions, and methods available in `near-api-js`. Consult this for really strange
- [Next.js API routes documenation](https://nextjs.org/docs/api-routes/introduction) - this is helpful if you're ever writing "server" code in the `pages/api`.
- [BAF's Curated content](https://bafnetwork.notion.site/Curated-Content-201a4b8fb6b94b929757331514a7467f) - There are plenty of resources on various webdev concepts or skills or tools collected here if you're struggling with something non-near, non-nextjs related.
