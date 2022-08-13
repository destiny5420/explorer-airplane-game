# The explorer

This 3d web game developed with three.js & blender, the protagonist's name is Adwa who is a free-sprited aviator, but he encountered meteorite turbulence during daily practice, need someone helps he out of danger.

- Use email to login, your score will store to the database through server.（Even you don't sign-up yet, server will automatically register）
- The battery keeps you far away, the meteorite makes your power break.

[The Explorer](https://explorer.stackergames.org/)

## Overview

1. How to use
   - Create database using [MongoDB Cloud Service](https://www.mongodb.com/cloud/atlas/register)（MongoDB Atlas）
   - Download game server and run it. Detail overview [here](https://github.com/destiny5420/explorer-airplane-game-server)
   - On your computer

## How to use

### Create database using MongoDB Cloud Service

We use mongo-db to store leader-board score and rank.

### Download game server

Because the game currently not support offline model, so must be running server to play.

Detail overview [here](https://github.com/destiny5420/explorer-airplane-game-server)

### On your computer

1. Your should have downloaded [Node.js](https://nodejs.org/en/) before（Node >= 14.17.1 & npm >= 6.14.13）
2. Download this repository via `git clone`
   ```shell
   git@github.com:destiny5420/explorer-airplane-game.git
   ```
3. Change directories
   ```shell
   cd explorer-airplane-game
   ```
4. Install related packages using yarn or npm
   ```shell
   npm install
   or
   yarn install
   ```
5. Run app
   ```shell
   npm dev
   or
   yarn dev
   ```

[http://localhost:9000](http://localhost:9000) will automatically open on your computer.
