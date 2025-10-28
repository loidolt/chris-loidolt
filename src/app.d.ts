// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      personSlug: 'chris' | 'julia' | 'theo' | 'jack' | 'family';
      user: {
        id: string;
        email: string;
        name?: string;
        avatar?: string;
        token: string;
        personId?: string; // Link to persons collection
      } | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
