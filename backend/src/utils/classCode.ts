import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O, 1/I) for codes students type by hand.
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(alphabet, 6);

export function generateClassCode(): string {
  return generate();
}
