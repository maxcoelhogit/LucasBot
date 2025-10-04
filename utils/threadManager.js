const threadMap = new Map();

export function getThreadId(userId) {
  return threadMap.get(userId) || null;
}

export function setThreadId(userId, threadId) {
  threadMap.set(userId, threadId);
}
