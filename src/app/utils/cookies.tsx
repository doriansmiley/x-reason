"use client";

export function getCookie(name: string) {
  try {
    let a = `; ${document.cookie}`.match(`;\\s*${name}=([^;]+)`);
    return a ? a[1] : "";
  } catch {
    return "";
  }
}
