/**
 * Seed image URLs.
 *
 * Re-exports the shared media map from `@/lib/images` so catalog / landing seed
 * modules keep a stable import while the canonical image URL set lives in one
 * app-wide module (which the public `data/` layer also consumes).
 */
export { BLOB_BASE, IMG } from "@/lib/images";
