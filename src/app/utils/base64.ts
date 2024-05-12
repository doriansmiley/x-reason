export function btoa(str: string | Buffer) {
  var buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), "binary");
  }

  return buffer.toString("base64");
}

export function atob(str: string) {
  return Buffer.from(str, "base64").toString("binary");
}
