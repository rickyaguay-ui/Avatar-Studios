// ElevenLabs premade voices, shown under ElevenLabs' own names. Labels come from the account's
// GET /v1/voices list. Sarah and Chris are the base voices of the two example hosts (Mesa and Reed),
// so only those two have pre-recorded Demo-mode clips. Alice and Eric are Live mode only.
// Voice IDs are public identifiers for ElevenLabs premade voices, not secrets.
import type { HostId } from '../types';

export interface ElevenVoice {
  id: string;            // ElevenLabs voice_id
  name: string;          // ElevenLabs' name for the voice
  tagline: string;       // ElevenLabs' description
  gender: 'female' | 'male';
  age: string;
  accent: string;
  host?: HostId;         // set when this voice is the base of an example host
  intro: string;         // default line: the voice announces who it is
}

export const ELEVEN_VOICES: ElevenVoice[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', tagline: 'Mature, Reassuring, Confident', gender: 'female', age: 'young', accent: 'american', host: 'mesa', intro: "Hi, I'm Mesa. Same app, different voice." },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', tagline: 'Charming, Down-to-Earth', gender: 'male', age: 'middle aged', accent: 'american', host: 'reed', intro: "Hi, I'm Reed. Same app, different voice." },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', tagline: 'Clear, Engaging Educator', gender: 'female', age: 'middle aged', accent: 'british', intro: "Hi, I'm Alice. Same app, different voice." },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', tagline: 'Smooth, Trustworthy', gender: 'male', age: 'middle aged', accent: 'american', intro: "Hi, I'm Eric. Same app, different voice." },
];
