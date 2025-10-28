<script lang="ts">
  /**
   * PWA Installer Component
   *
   * Handles install prompt and PWA lifecycle
   */

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { pwaInfo } from 'virtual:pwa-info';

  let deferredPrompt: any = null;
  let showInstallButton = false;

  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  onMount(() => {
    if (!browser) return;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 Install prompt available');
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton = true;
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed');
      showInstallButton = false;
      deferredPrompt = null;
    });
  });

  async function installPWA() {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // Clear the prompt
    deferredPrompt = null;
    showInstallButton = false;
  }
</script>

{#if showInstallButton}
  <button
    on:click={installPWA}
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
