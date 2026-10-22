# Rule Out pack art: Gemini prompts

Prompts for the three launch packs: **Monster Mash** (free with an account),
**Dogs** and **Fantasy** (paid). Each pack is 24 cards in the same style as
the Classic board.

## How to generate

1. Open [gemini.google.com](https://gemini.google.com) and start a **new plain
   chat for each pack**. A chat remembers the references and earlier results,
   which keeps the 24 images consistent.
2. Attach two Classic cards as style references:
   `public/boards/classic/ethan.webp` and `public/boards/classic/bella.webp`
   (bright, friendly, and no frame, like most of the Classic board).
3. Paste the pack's **style message** (below) as the first message.
4. Then send the character prompts **one at a time**. If a result is wrong
   (missing trait, extra eye, text in the image, different style), say
   "Try again, keep the style, and make sure it has …" or regenerate.
5. Download each image and save it as
   `art/<pack>/<name>.png`, for example `art/monster-mash/boris.png`.
   File names don't have to be exact; I'll sort them out.

**Free limit:** about 20 images a day, so plan on a pack every day or two
(retries count too). Start with Monster Mash.

**What to check in each image (for you, not Gemini; the style message already tells Gemini):**
- One character, head and shoulders, centered, looking at the viewer.
- No text, letters, numbers, logos or watermarks drawn in the image.
- The listed traits must be clearly visible at thumbnail size. Those traits
  power the game's yes/no questions, so a hat that's barely visible or an
  extra eye that wasn't asked for breaks the game. I'll check every image
  before it goes in.
- Nothing that looks like a famous character. If a result reminds you of
  one (Monsters, Inc., Toy Story aliens, Snoopy, Scooby-Doo, Gandalf,
  Dumbledore, Gimli…), regenerate it.

---

## Style message (paste first in every chat, then add the pack line)

```
I'm making a set of 24 character cards for a guessing game. Match the attached reference images' art style exactly:

- Flat vector cartoon portrait, head and shoulders, centered, facing the viewer.
- Thick dark navy outlines, flat colors with very light soft shading, simple friendly features.
- A solid pastel background that fills the whole square, with no frame, border or margin, like the references.
- Square 1:1 image.
- No text, letters, numbers or logos anywhere.
- Every card must look like part of the same set.

I'll describe one character per message. Draw only that character, and make every listed feature clearly visible.
```

Then add one line for the pack:

- **Monster Mash:** `This set is friendly, cute monsters (not scary). Smiling, kid-friendly, original designs that don't resemble any existing cartoon or movie characters.`
- **Dogs:** `This set is cartoon dogs, drawn like the references: friendly, expressive, head and shoulders, with the chest and shoulders going all the way off the bottom edge of the image (no floating cutout). Original designs, not based on any famous cartoon dog.`
- **Fantasy:** `This set is fantasy characters (wizards, knights, elves, dwarves and more). Friendly, kid-friendly, original designs that don't resemble characters from any book, movie or game.`

---

## Monster Mash (free with an account)

Traits are balanced so questions split the board: 6 colors × 4 monsters;
6 have one eye, 6 have three eyes, 12 have two; and about a third to half
have horns, fangs, fur, spots, antennae or an accessory. No monster is green
with one or three eyes (too close to Monsters, Inc. and the Toy Story aliens).

| Name | Color | Eyes | Horns | Fangs | Fuzzy | Spots | Antennae | Accessory |
|---|---|---|---|---|---|---|---|---|
| Boris | purple | 2 | ✓ | ✓ | | | | bow tie |
| Mona | pink | 3 | | | ✓ | | ✓ | flower |
| Grub | green | 2 | | ✓ | | ✓ | ✓ | |
| Fang | blue | 1 | ✓ | ✓ | | | | |
| Wanda | yellow | 2 | ✓ | | ✓ | | | striped scarf |
| Gloop | orange | 3 | | | | ✓ | | |
| Mabel | orange | 1 | | | ✓ | | ✓ | monocle |
| Bix | blue | 2 | | ✓ | | ✓ | | baseball cap |
| Wisp | purple | 1 | | | | | ✓ | |
| Hex | yellow | 3 | ✓ | ✓ | | | | |
| Pip | pink | 2 | ✓ | | | ✓ | | |
| Snork | green | 2 | | ✓ | ✓ | | | |
| Tully | blue | 3 | | | ✓ | | | headphones |
| Ozzy | pink | 1 | ✓ | | | ✓ | | |
| Razz | purple | 2 | | | | ✓ | ✓ | |
| Fizz | yellow | 1 | | ✓ | | | | party hat |
| Gubbo | green | 2 | ✓ | | ✓ | | | |
| Lumpy | orange | 3 | ✓ | | | ✓ | | |
| Nib | blue | 2 | | | | | ✓ | hair bow |
| Doodle | pink | 2 | | ✓ | ✓ | | | |
| Moxie | yellow | 2 | ✓ | | | ✓ | | earrings |
| Squib | purple | 3 | | ✓ | | | | round glasses |
| Bramble | green | 2 | ✓ | ✓ | ✓ | | | |
| Kip | orange | 1 | ✓ | | | | ✓ | beanie |

### Prompts

Copy one line per message.

1. **Boris:** `Boris: a smooth purple monster with two eyes, two small curved cream horns, two little fangs in a big smile, wearing a red bow tie. Light yellow background.`
2. **Mona:** `Mona: a fluffy pink furry monster with three eyes in a row, two thin antennae with round tips, no horns, no fangs, a white flower tucked behind one antenna. Light blue background.`
3. **Grub:** `Grub: a smooth green monster with two eyes, two thin antennae, darker green spots on its head, two little fangs in a wide grin. Light orange background.`
4. **Fang:** `Fang: a smooth blue monster with ONE large eye in the middle of its face, two pointed cream horns, a toothy smile with two fangs, an oval-shaped head. Light peach background.`
5. **Wanda:** `Wanda: a fluffy yellow furry monster with two eyes, two curly cream horns, a gentle closed-mouth smile with no fangs, wearing a red and white striped scarf. Light purple background.`
6. **Gloop:** `Gloop: a smooth orange blob monster with three eyes (one big in the middle, two smaller), darker orange spots, no horns, no antennae, a happy open smile with no fangs. Light teal background.`
7. **Mabel:** `Mabel: a fluffy orange furry monster with ONE big eye wearing a gold monocle, two thin antennae, no horns, a sweet closed smile with no fangs. Light green background.`
8. **Bix:** `Bix: a smooth blue monster with two eyes, darker blue spots, two little fangs in a grin, wearing a red baseball cap. Light yellow background.`
9. **Wisp:** `Wisp: a smooth light-purple monster with a tall teardrop-shaped head, ONE big eye, two thin antennae, no horns, no fangs, a small shy smile. Light mint background.`
10. **Hex:** `Hex: a smooth yellow monster with three eyes in a triangle, two short pointed horns, a wide smile with two fangs. Light blue background.`
11. **Pip:** `Pip: a small round smooth pink monster with two big eyes, two tiny horns, darker pink spots on its cheeks and head, a happy closed smile with no fangs. Light green background.`
12. **Snork:** `Snork: a shaggy green furry monster with two eyes, a big grin with two fangs, no horns, no antennae, no spots. Light pink background.`
13. **Tully:** `Tully: a fluffy blue furry monster with three eyes in a row, no horns, no fangs, wearing big red over-ear headphones, a relaxed smile. Light orange background.`
14. **Ozzy:** `Ozzy: a smooth pink monster with ONE big eye, two curved horns, darker pink spots, a happy smile with no fangs. Light teal background.`
15. **Razz:** `Razz: a smooth purple monster with two eyes, two thin antennae with star-shaped tips, lighter purple spots, a cheeky smile with no fangs, no horns. Light yellow background.`
16. **Fizz:** `Fizz: a smooth yellow monster with ONE big eye, a grin with two fangs, no horns, wearing a striped party hat. Light purple background.`
17. **Gubbo:** `Gubbo: a big fluffy green furry monster with two small eyes, two large curved horns, a goofy closed smile with no fangs, no spots. Light peach background.`
18. **Lumpy:** `Lumpy: a lumpy smooth orange monster with three eyes of different sizes, two stubby horns, darker orange spots, a wide smile with no fangs. Light blue background.`
19. **Nib:** `Nib: a small smooth blue monster with two big eyes, two thin antennae, a pink hair bow on top of its head, a sweet smile with no fangs, no horns. Light yellow background.`
20. **Doodle:** `Doodle: a shaggy pink furry monster with two eyes, a big grin with two fangs, no horns, no antennae. Light mint background.`
21. **Moxie:** `Moxie: a smooth yellow monster with two eyes, two curved horns, darker yellow spots, wearing round gold hoop earrings, a confident smile with no fangs. Light purple background.`
22. **Squib:** `Squib: a smooth purple monster with three eyes in a row, all three behind one wide pair of round glasses, a smile with two fangs, no horns. Light green background.`
23. **Bramble:** `Bramble: a shaggy green furry monster with two eyes, two big curved horns, a wide grin with two fangs. Light orange background.`
24. **Kip:** `Kip: a smooth orange monster with ONE big eye, two small horns poking through a knitted blue beanie, two thin antennae, a happy smile with no fangs. Light blue background.`

---

## Dogs (paid)

6 coat colors × 4 dogs. About a third have ears that stand up, a third are
fluffy, 10 have their tongue out, 11 wear a collar, and 9 wear something
else (bandana, hat or glasses). Dogs with a bandana have no collar.

| Name | Breed | Color | Ears up | Fluffy | Tongue out | Collar | Accessory |
|---|---|---|---|---|---|---|---|
| Biscuit | beagle | brown | | | ✓ | ✓ | |
| Coco | chocolate labrador | brown | | | ✓ | ✓ | |
| Otis | dachshund | brown | | | | ✓ | beanie |
| Rocky | boxer | brown | | | | ✓ | |
| Bear | black labrador | black | | | | | bandana |
| Duke | scottish terrier | black | ✓ | | | | flat cap |
| Ollie | pug | black | | | ✓ | ✓ | |
| Lola | poodle | black | | ✓ | | | |
| Waffles | bichon | white | | ✓ | ✓ | | |
| Scout | west highland terrier | white | ✓ | | | ✓ | |
| Bandit | bull terrier | white | ✓ | | | | sunglasses |
| Maple | samoyed | white | ✓ | ✓ | | | |
| Daisy | golden retriever | golden | | ✓ | ✓ | | bandana |
| Buddy | yellow labrador | golden | | | ✓ | | |
| Penny | cocker spaniel | golden | | ✓ | | ✓ | |
| Rosie | goldendoodle | golden | | ✓ | | | |
| Luna | husky | gray | ✓ | ✓ | ✓ | | |
| Pepper | schnauzer | gray | ✓ | | | | round glasses |
| Ziggy | greyhound | gray | | | ✓ | ✓ | |
| Tucker | weimaraner | gray | | | | ✓ | round glasses |
| Mochi | shiba inu | ginger | ✓ | | | ✓ | |
| Ginger | corgi | ginger | ✓ | | ✓ | | bandana |
| Pickles | pomeranian | ginger | ✓ | ✓ | | | party hat |
| Max | irish setter | ginger | | | ✓ | ✓ | |

### Prompts

1. **Biscuit:** `Biscuit: a brown and white beagle with long floppy ears, tongue out in a happy pant, wearing a red collar. Light blue background.`
2. **Coco:** `Coco: a chocolate-brown labrador with floppy ears, tongue out, wearing a green collar. Light yellow background.`
3. **Otis:** `Otis: a brown dachshund with long floppy ears, mouth closed in a small smile, wearing a blue collar and a knitted orange beanie. Light mint background.`
4. **Rocky:** `Rocky: a brown boxer dog with a white chest, short folded ears, mouth closed with a goofy expression, wearing a black collar. Light peach background.`
5. **Bear:** `Bear: a black labrador with floppy ears, mouth closed in a calm smile, no collar, wearing a red bandana around the neck. Light blue background.`
6. **Duke:** `Duke: a black scottish terrier with pointed ears standing straight up, a bushy beard and eyebrows, mouth closed, no collar, wearing a gray flat cap. Light yellow background.`
7. **Ollie:** `Ollie: a black pug with a wrinkly face, small folded ears, tongue out, wearing a yellow collar. Light pink background.`
8. **Lola:** `Lola: a black poodle with very fluffy curly fur and a round fluffy topknot, floppy ears, mouth closed in a smile, no collar. Light teal background.`
9. **Waffles:** `Waffles: a white bichon with very fluffy round cotton-ball fur, tongue out, no collar. Light purple background.`
10. **Scout:** `Scout: a white west highland terrier with pointed ears standing straight up, mouth closed in a smile, wearing a red collar. Light green background.`
11. **Bandit:** `Bandit: a white bull terrier with an egg-shaped head and pointed ears standing up, wearing black sunglasses, mouth closed in a grin, no collar. Light orange background.`
12. **Maple:** `Maple: a white samoyed with very fluffy fur and pointed ears standing up, a big closed-mouth smile, no collar. Light blue background.`
13. **Daisy:** `Daisy: a golden retriever with fluffy golden fur and floppy ears, tongue out, no collar, wearing a blue bandana around the neck. Light pink background.`
14. **Buddy:** `Buddy: a yellow labrador with short golden fur and floppy ears, tongue out, no collar. Light green background.`
15. **Penny:** `Penny: a golden cocker spaniel with long fluffy wavy ears, mouth closed in a sweet smile, wearing a pink collar. Light blue background.`
16. **Rosie:** `Rosie: a golden goldendoodle with very fluffy curly fur, floppy ears, mouth closed in a smile, no collar. Light purple background.`
17. **Luna:** `Luna: a gray and white husky with fluffy fur, pointed ears standing up, light blue eyes, tongue out, no collar. Light yellow background.`
18. **Pepper:** `Pepper: a gray schnauzer with pointed ears standing up, a bushy gray beard and eyebrows, wearing round black glasses, mouth closed, no collar. Light peach background.`
19. **Ziggy:** `Ziggy: a sleek gray greyhound with a long narrow face, small folded ears, tongue out, wearing a purple collar. Light mint background.`
20. **Tucker:** `Tucker: a silver-gray weimaraner with floppy ears and light eyes, wearing round tortoiseshell glasses and a brown collar, mouth closed. Light orange background.`
21. **Mochi:** `Mochi: a ginger and cream shiba inu with pointed ears standing up, a closed-mouth smile, wearing a red collar. Light teal background.`
22. **Ginger:** `Ginger: a ginger and white corgi with big pointed ears standing up, tongue out, no collar, wearing a green bandana around the neck. Light blue background.`
23. **Pickles:** `Pickles: a fluffy ginger pomeranian with small pointed ears standing up, mouth closed in a smile, no collar, wearing a striped party hat. Light green background.`
24. **Max:** `Max: a red-ginger irish setter with long silky floppy ears, tongue out, wearing a blue collar. Light yellow background.`

---

## Fantasy (paid)

A mix of 10 women and 14 men. 8 have beards, 6 have pointed ears, 6 wear
armor, 5 wear a crown, 10 wear something else on their head (hat, hood or
helmet), 4 wear glasses or goggles, and 2 are green-skinned orcs with tusks.
Hair colors: white/gray/silver 5, black 4, red 4, blonde 4, brown 4, and 3 are bald.
The wizard deliberately avoids Gandalf and Dumbledore (no long gray beard,
no purple starry hat, no half-moon glasses), and the dwarf avoids Gimli
(no horned or iron helmet).

| Name | Who | Hair | Beard | Pointed ears | Armor | Crown | Hat/hood/helmet | Glasses | Smiling |
|---|---|---|---|---|---|---|---|---|---|
| Alaric | wizard | white | ✓ | | | | ✓ hat | ✓ | ✓ |
| Brenna | warrior | red | | | ✓ | | | | ✓ |
| Cedric | knight | brown | | | ✓ | | | | |
| Dwyn | dwarf | red | ✓ | | ✓ | | ✓ leather cap | | |
| Elowen | elf archer | blonde | | ✓ | | | ✓ hood | | ✓ |
| Faelan | elf noble | black | | ✓ | | ✓ | | | |
| Gorrin | dwarf | bald | ✓ black | | | | | | ✓ |
| Hilda | queen | gray | | | | ✓ | | | ✓ |
| Isolde | sorceress | black | | | | | ✓ hat | | |
| Jorund | barbarian | blonde | ✓ | | | | | | ✓ |
| Kade | rogue | brown | | | | | ✓ hood | | |
| Lyra | bard | red | | | | | ✓ feathered cap | | ✓ |
| Mirren | elf mage | white | | ✓ | | | | ✓ | |
| Nyx | orc warrior | black | | | ✓ | | | | |
| Orrin | monk | bald | ✓ gray | | | | | ✓ | ✓ |
| Pell | squire | blonde | | | ✓ | | ✓ helmet | | ✓ |
| Quill | gnome inventor | white | ✓ | ✓ | | | ✓ hat | ✓ goggles | ✓ |
| Rowan | ranger | brown | ✓ | | | | ✓ hood | | |
| Sable | elf | silver | | ✓ | | ✓ | | | |
| Thorne | orc | bald | | | ✓ | | | | |
| Ulric | king | brown | ✓ | | | ✓ | | | |
| Vesna | herbalist | red | | | | | ✓ hood | | |
| Wren | fairy | blonde | | ✓ | | | | | ✓ |
| Ysolde | princess | black | | | | ✓ | | | ✓ |

### Prompts

1. **Alaric:** `Alaric: a cheerful old wizard with a round face, a short curly white beard, round wire glasses, wearing a tall orange pointed hat with a crescent moon patch and an orange robe. Big smile. Light blue background.`
2. **Brenna:** `Brenna: a young woman warrior with long red braids and freckles, wearing silver plate armor on her shoulders, no helmet, a confident smile. Light green background.`
3. **Cedric:** `Cedric: a young knight with short brown hair, wearing silver plate armor with a blue tabard, no helmet, a serious determined expression. Light yellow background.`
4. **Dwyn:** `Dwyn: a sturdy dwarf with a long braided red beard, wearing a brown leather cap and dark leather-and-steel armor, a stern expression. Light purple background.`
5. **Elowen:** `Elowen: an elf woman with long blonde hair, pointed ears clearly visible, wearing a green hood pushed back slightly and a quiver strap over her shoulder, a gentle smile. Light peach background.`
6. **Faelan:** `Faelan: an elf man with long straight black hair, pointed ears clearly visible, wearing a thin silver circlet crown and an elegant blue robe, a calm expression. Light yellow background.`
7. **Gorrin:** `Gorrin: a cheerful bald dwarf with a big bushy black beard, rosy cheeks, wearing a brown leather vest, a big grin. Light teal background.`
8. **Hilda:** `Hilda: an older queen with gray hair in a bun, wearing a gold crown with red gems and a purple royal cloak, a warm smile. Light green background.`
9. **Isolde:** `Isolde: a sorceress with long black hair, wearing a wide-brimmed dark green pointed witch hat and a dark green robe, a mysterious closed-mouth expression. Light orange background.`
10. **Jorund:** `Jorund: a big barbarian with long blonde hair and a blonde beard, wearing a gray fur cloak over bare shoulders, no helmet, a hearty laughing smile. Light blue background.`
11. **Kade:** `Kade: a young rogue with messy brown hair under a dark gray hood, a small scar on one cheek, wearing a dark leather jacket, a sly closed-mouth smirk. Light pink background.`
12. **Lyra:** `Lyra: a bard woman with wavy red hair, wearing a green cap with a long white feather and a yellow tunic, a lute strap across her shoulder, a big smile. Light purple background.`
13. **Mirren:** `Mirren: an elf mage with long white hair, pointed ears clearly visible, wearing small round glasses and a blue mage robe, no hat, a thoughtful expression. Light peach background.`
14. **Nyx:** `Nyx: an orc warrior woman with green skin, two small tusks, long black hair in a ponytail, wearing dark iron shoulder armor, a fierce but friendly expression. Light yellow background.`
15. **Orrin:** `Orrin: a kind old bald monk with a short gray beard, wearing round glasses and a brown hooded robe with the hood down, a gentle smile. Light mint background.`
16. **Pell:** `Pell: a young squire with short blonde hair, wearing a simple round steel helmet with an open face and light chainmail armor, an eager smile. Light orange background.`
17. **Quill:** `Quill: a small gnome inventor with pointed ears, a fluffy white beard, brass goggles over his eyes, wearing a tall red pointed hat, a big grin. Light blue background.`
18. **Rowan:** `Rowan: a ranger with a short brown beard, wearing a dark green hood up and a brown cloak, a calm serious expression. Light yellow background.`
19. **Sable:** `Sable: an elf woman with dark brown skin and long silver hair, pointed ears clearly visible, wearing a thin gold circlet crown and a deep purple gown, a calm expression. Light teal background.`
20. **Thorne:** `Thorne: a big bald orc with green skin and two tusks, wearing heavy dark iron shoulder armor, a gruff but friendly expression. Light pink background.`
21. **Ulric:** `Ulric: a king with short brown hair and a full brown beard, wearing a gold crown and a red royal cloak with white fur trim, a serious expression. Light blue background.`
22. **Vesna:** `Vesna: an herbalist woman with long red hair, wearing a moss-green hood up and a sprig of leaves pinned to her cloak, a calm expression. Light peach background.`
23. **Wren:** `Wren: a fairy with short blonde hair, pointed ears clearly visible, small translucent wings visible behind her shoulders, wearing a leaf-green top, a big smile. Light purple background.`
24. **Ysolde:** `Ysolde: a young princess with long black hair, wearing a small gold tiara crown and a teal gown, a bright smile. Light green background.`
