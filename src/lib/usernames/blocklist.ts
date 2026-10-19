// ============================================================
// ArcadeKit — Username blocklist
// Based on TerraVia's curated list (itself drawn from
// surge-ai/profanity and web-mech/badwords), split into two tiers
// for a site with a young audience:
//
//   BLOCKED_ANYWHERE  — slurs and unambiguous obscenities, blocked
//                       even inside a longer name ("xshitx").
//   BLOCKED_AS_WORD   — short words that also occur inside innocent
//                       words ("ass" in "classic"), blocked only as a
//                       whole word or a separate part of the name.
//
// Checked against a normalized copy: lowercased, leet-speak decoded,
// underscores and digits removed. It will never catch everything;
// usernames can also be fixed by hand in the database.
// ============================================================

export const BLOCKED_ANYWHERE: readonly string[] = [
  // Slurs (racial / ethnic)
  "chink", "darkie", "gook", "kike", "nazi", "nigga", "nigger", "raghead",
  "redskin", "wetback", "whitepower", "whitepride", "heilhitler", "hitler",
  // Slurs (sexual orientation / gender / disability)
  "faggot", "tranny", "retard",
  // Sexual / vulgar
  "arsehole", "asshole", "bastard", "bitch", "blowjob",
  "bollock", "boner", "boob", "buttplug", "clit", "cocksucker", "cunt",
  "dildo", "ejaculat", "erection", "fellatio", "fuck", "fuk", "handjob",
  "hentai", "jizz", "masturbat", "milf", "molest", "motherfuck",
  "nipple", "nude", "orgasm", "orgy", "pedophile", "penis", "porn",
  "pussy", "rapist", "rimjob", "scrotum", "semen", "sexy", "shit",
  "slut", "smegma", "testicle", "twat", "vagina", "viagra", "whore",
  // Violence / self-harm
  "killyourself", "suicide",
  // Drugs
  "cocaine",
];

export const BLOCKED_AS_WORD: readonly string[] = [
  "ass", "butt", "cum", "dick", "dyke", "fag", "fags", "hoe", "hoes", "homo",
  "jap", "piss", "sex", "spic", "spick", "tit", "tits", "coon", "kkk", "isis",
  // Would block innocent names if matched anywhere (analyst, Peacock,
  // grape, torpedo, thorny, BlueSkys, Heroine, Swanky, method)
  "anal", "anus", "cock", "rape", "pedo", "horny", "kys", "heroin", "wank", "meth",
];

/**
 * Names that would look official or confuse players. Matched against
 * the normalized name as a whole.
 */
export const RESERVED: readonly string[] = [
  "admin", "administrator", "arcadekit", "arcade", "kit", "mod", "moderator",
  "staff", "support", "help", "official", "system", "root", "owner", "dev",
  "developer", "team", "bot", "null", "undefined", "anonymous", "guest",
  "player", "user", "everyone", "here", "account", "settings", "signin",
  "signout", "login", "logout", "register", "api", "www",
];
