<script lang="ts">
  import { browser } from '$app/environment';
  import type { LocationPublic } from '$lib/pocketbase';
  import PasswordModal from '$lib/components/PasswordModal.svelte';
  import { storage } from '$lib/utils/helpers';
  import { MAP_CONFIG } from '$lib/config/map';

  /**
   * Handles security-related functionality for private locations
   * Manages locked state, password authentication, and coordinate fuzzing
   */

  type Props = {
    onUnlock?: (locationId: string) => void;
  };

  let { onUnlock }: Props = $props();

  // Security state
  let unlockedLocations = $state<Set<string>>(new Set());
  let showPasswordModal = $state(false);
  let selectedLocation = $state<LocationPublic | null>(null);
  let passwordError = $state('');

  // Load unlocked locations from storage on mount
  $effect(() => {
    if (browser) {
      const stored = storage.get<string[]>(
        MAP_CONFIG.STORAGE_KEYS.UNLOCKED_LOCATIONS,
        []
      );
      unlockedLocations = new Set(stored);
    }
  });

  // Save unlocked locations to storage when changed
  $effect(() => {
    if (browser && unlockedLocations.size > 0) {
      storage.set(
        MAP_CONFIG.STORAGE_KEYS.UNLOCKED_LOCATIONS,
        Array.from(unlockedLocations)
      );
    }
  });

  /**
   * Check if a location is locked (private and not unlocked)
   */
  export function isLocationLocked(location: LocationPublic): boolean {
    return location.privacy === 'Private' && !unlockedLocations.has(location.id);
  }

  /**
   * Handle location click - show password modal if locked
   */
  export function handleLocationClick(location: LocationPublic): LocationPublic | null {
    if (isLocationLocked(location)) {
      selectedLocation = location;
      showPasswordModal = true;
      passwordError = '';
      return null; // Location is locked
    } else {
      return location; // Location is unlocked or public
    }
  }

  /**
   * Attempt to unlock a location with shared token
   */
  export async function unlockWithToken(
    locationId: string,
    token: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/unlock-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          password: token,
        }),
      });

      const data = await response.json();

      if (data.success) {
        unlockedLocations.add(locationId);
        unlockedLocations = unlockedLocations; // Trigger reactivity
        onUnlock?.(locationId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unlocking location with token:', error);
      return false;
    }
  }

  /**
   * Handle password submission
   */
  async function handlePasswordSubmit(password: string) {
    if (!selectedLocation) return;

    try {
      const response = await fetch('/api/unlock-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedLocation.id,
          password,
        }),
      });

      const data = await response.json();

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = data.retryAfter || 60;
        const minutes = Math.ceil(retryAfter / 60);
        passwordError = `Too many attempts. Please try again in ${minutes} minute${
          minutes !== 1 ? 's' : ''
        }.`;
        return;
      }

      if (data.success) {
        // Add to unlocked set
        unlockedLocations.add(selectedLocation.id);
        unlockedLocations = unlockedLocations; // Trigger reactivity

        // Notify parent
        onUnlock?.(selectedLocation.id);

        // Close modal
        showPasswordModal = false;
        passwordError = '';
      } else {
        passwordError = data.error || 'Incorrect password';
      }
    } catch (error) {
      console.error('Error unlocking location:', error);
      passwordError = 'Failed to unlock location';
    }
  }

  /**
   * Handle password modal cancel
   */
  function handlePasswordCancel() {
    showPasswordModal = false;
    selectedLocation = null;
    passwordError = '';
  }

  /**
   * Expose unlocked locations set
   */
  export function getUnlockedLocations(): Set<string> {
    return unlockedLocations;
  }
</script>

<!-- Password Modal -->
{#if showPasswordModal && selectedLocation}
  <PasswordModal
    locationName={selectedLocation.name}
    onSubmit={handlePasswordSubmit}
    onCancel={handlePasswordCancel}
    error={passwordError}
  />
{/if}
