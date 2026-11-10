type Fields = Record<string, unknown>;

const stamp = () => new Date().toISOString();

const emit = (level: string, tag: string, msg: string, fields?: Fields) => {
  const base = `[${stamp()}] [${level}] [${tag}] ${msg}`;
  if (fields && Object.keys(fields).length > 0) {
    try {
      console.log(base, JSON.stringify(fields));
    } catch {
      console.log(base, fields);
    }
  } else {
    console.log(base);
  }
};

export const log = {
  info: (tag: string, msg: string, fields?: Fields) =>
    emit("info", tag, msg, fields),
  warn: (tag: string, msg: string, fields?: Fields) =>
    emit("warn", tag, msg, fields),
  error: (tag: string, msg: string, fields?: Fields) => {
    const base = `[${stamp()}] [error] [${tag}] ${msg}`;
    if (fields) {
      try {
        console.error(base, JSON.stringify(fields));
      } catch {
        console.error(base, fields);
      }
    } else {
      console.error(base);
    }
  },
};
