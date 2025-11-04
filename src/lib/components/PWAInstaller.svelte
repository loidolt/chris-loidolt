<script lang="ts">
  /**
   * PWA Installer Component
   *
   * Handles install prompt and PWA lifecycle
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  let showInstallButton = $state(false);

  onMount(() => {
    if (!browser) return;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 Install prompt available');
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      showInstallButton = true;
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed');
      showInstallButton = false;
      deferredPrompt = null;
    });

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('🎉 Running as PWA');
    }
  });

  async function installPWA() {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      // Clear the prompt
      deferredPrompt = null;
      showInstallButton = false;
    }
  }
</script>

{#if showInstallButton}
  <button
    onclick={installPWA}
    class="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all hover:scale-105"
    style="
      background-color: var(--accent-primary);
      color: var(--bg-primary);
      border: 1px solid var(--accent-primary);
    "
  >
    📱 Install App
  </button>
{/if}
