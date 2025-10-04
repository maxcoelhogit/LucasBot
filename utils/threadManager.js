const threadMap = {};

export function getThreadId(userId) {
  if (!threadMap[userId]) {
    threadMap[userId] = null;
  }
  return threadMap[userId];
}

export function setThreadId(userId, threadId) {
  threadMap[userId] = threadId;
}
