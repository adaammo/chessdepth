# ChessDepth

ChessDepth is a free chess game analysis tool built around reviewing games played on Chess.com. 

The main goal is pretty simple: enter a Chess.com username, retrieve the player's game history from the last six months, and allow any stored game to be reviewed move by move using Stockfish. This includes some normalization of the data such as displaying opening performance by side

The review UI includes the current evaluation, move history, move classifications, and a summary of how both players performed.

ChessDepth will also track account-level statistics such as the number of blunders, strong moves, and other engine-derived classifications across analyzed games. (*In development*)

## How It Works

A user enters a Chess.com username and the backend first checks whether the account exists and whether it has game history within the supported six-month window.

Chess.com's API can rate-limit parallel requests, so ChessDepth uses **BullMQ + Redis** to manage game-sync jobs. A worker processes these jobs with a concurrency of one, allowing Chess.com requests to remain serialized instead of multiple users hitting the API in parallel.

For a player that has never been loaded before, ChessDepth has to fetch their available archives, normalize the returned data, calculate profile statistics, and insert their profile and games into PostgreSQL.

**This is currently the largest bottleneck in the service.**

Once a player exists in the database, ChessDepth uses the stored data as its source of truth and only synchronizes newer game data. In current tests, repeated profile syncs have been roughly **70–80% faster** than the initial import, although queue length can still affect the total time a user waits.

Built with Next.js, Node.js/Express.js, TypeScript, React, Tailwind CSS, PostgreSQL & Supabase.

