export default function getLinkByEmail(email: string): string {
  let domain = email.split('@')[1];
  if (!domain) {
    return '#';
  }

  let corresponding = MAIL_PROVIDER_MAP[domain];

  if (!corresponding) {
    corresponding = domain;
  }
  return  `https://${corresponding}`;
}

export const MAIL_PROVIDER_MAP: Record<string, string> = {
  // Google
  "gmail.com": "mail.google.com",
  "googlemail.com": "mail.google.com",

  // Microsoft
  "outlook.com": "outlook.live.com/mail",
  "hotmail.com": "outlook.live.com/mail",
  "live.com": "outlook.live.com/mail",
  "msn.com": "outlook.live.com/mail",

  // Yahoo ecosystem
  "yahoo.com": "mail.yahoo.com",
  "ymail.com": "mail.yahoo.com",
  "rocketmail.com": "mail.yahoo.com",
  "aol.com": "mail.aol.com",

  // Apple
  "icloud.com": "www.icloud.com/mail",
  "me.com": "www.icloud.com/mail",
  "mac.com": "www.icloud.com/mail",

  // Proton
  "protonmail.com": "mail.proton.me",
  "proton.me": "mail.proton.me",
  "pm.me": "mail.proton.me",

  // Tuta
  "tutanota.com": "mail.tutanota.com",
  "tuta.com": "mail.tutanota.com",

  // Yandex
  "yandex.ru": "mail.yandex.ru",
  "yandex.com": "mail.yandex.com",
  "ya.ru": "mail.yandex.ru",

  // Mail.ru
  "mail.ru": "e.mail.ru",
  "bk.ru": "e.mail.ru",
  "inbox.ru": "e.mail.ru",
  "list.ru": "e.mail.ru",

  // Rambler
  "rambler.ru": "mail.rambler.ru",
  "lenta.ru": "mail.rambler.ru",
  "autorambler.ru": "mail.rambler.ru",
  "myrambler.ru": "mail.rambler.ru",

  // Zoho
  "zoho.com": "mail.zoho.com",
  "zohomail.com": "mail.zoho.com",

  // GMX
  "gmx.com": "www.gmx.com",
  "gmx.de": "www.gmx.net",

  // Mail.com
  "mail.com": "www.mail.com/int/",

  // Fastmail
  "fastmail.com": "www.fastmail.com/mail",

  // Chinese providers
  "qq.com": "mail.qq.com",
  "163.com": "mail.163.com",
  "126.com": "mail.126.com",

  // ISP mail providers (examples)
  "comcast.net": "connect.xfinity.com",
  "att.net": "currently.att.yahoo.com",
  "sbcglobal.net": "currently.att.yahoo.com",
  "bellsouth.net": "currently.att.yahoo.com"
};
