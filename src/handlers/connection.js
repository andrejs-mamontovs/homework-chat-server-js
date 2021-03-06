import { usernames, mapTable } from "../constants/globals";
import {
  DISCONNECT,
  SEND_MESSAGE,
  INCOMMING_MESSAGE,
  LOGIN,
  LOGOFF
} from "../constants";

import { log } from "../logger";

// read timeout value from process env. or set default value;
const timeoutInSeconds = process.env.TIMEOUT || 20;
log(`Timeout is set to: ${process.env.TIMEOUT} sec.`);

const onConnectionListener = client => {
  log(`IP: ${client.request.connection.remoteAddress}`);

  let timeIsOutTimer;

  const setTimer = () => {
    clearTimeout(timeIsOutTimer);
    timeIsOutTimer = setTimeout(() => {
      log(`timeout for: ${client.id}`);
      client.emit(LOGOFF, {});
      removeUser(client.id);
    }, timeoutInSeconds * 1000);

    timeIsOutTimer.unref();
  };

  log(`A user ${client.id} connected`);

  client.on(LOGIN, data => {
    log(`Sets '${data.username}' username before start conversation`);
    user = { username: data.username };
    usernames.push(user);
    mapTable[client.id] = user;
    client.emit(LOGIN, {});
    client.emit(INCOMMING_MESSAGE, { text: "Welcome to chat" });
    client.broadcast.emit(INCOMMING_MESSAGE, {
      text: `User ${user.username} join chat`
    });
    setTimer();
  });

  client.on(SEND_MESSAGE, data => {
    log(`Message received ${data.text}`);
    client.broadcast.emit(INCOMMING_MESSAGE, data);
    setTimer();
  });

  client.on(DISCONNECT, () => {
    clearTimeout(timeIsOutTimer);
    if (mapTable[client.id]) {
      const user = mapTable[client.id].username;
      client.broadcast.emit(INCOMMING_MESSAGE, {
        text: `User ${user} leaved chat`
      });
    }
    log(`User ${client.id} disconnected`);
    removeUser(client.id);
  });
};

const removeUser = id => {
  if (mapTable[id]) {
    const username = mapTable[id].username;
    let index = usernames.map(i => i.username).indexOf(username);
    while (index > -1) {
      usernames.splice(index, 1);
      index = usernames.map(i => i.username).indexOf(username);
    }
    delete mapTable[id];
  }
};

module.exports = {
  onConnectionListener
};
