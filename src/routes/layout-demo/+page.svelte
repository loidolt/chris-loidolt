<script lang="ts">
  /**
   * Layout System Demo Page
   *
   * Demonstrates all layout components and patterns
   */

  import {
    Container,
    Grid,
    Stack,
    Flex,
    Section,
    Card,
    Panel,
    Split,
    PageHeader,
    Tabs,
    Modal
  } from '$lib/layouts';
  import { isMobile, isDesktop, currentBreakpoint } from '$lib/utils/breakpoints';

  // Demo state
  let modalOpen = false;
  let activeTab = 'overview';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'components', label: 'Components' },
    { id: 'responsive', label: 'Responsive' }
  ];

  const demoCards = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    description: 'Example card content with some text'
  }));
</script>

<Container>
  <PageHeader
    title="Layout System Demo"
    subtitle="Comprehensive demonstration of all layout components"
    breadcrumbs={[
      { label: 'Home', href: '/' },
      { label: 'Layout Demo' }
    ]}
  >
    <button
      slot="actions"
      class="px-4 py-2 rounded"
      style="background-color: var(--accent-primary); color: var(--bg-primary);"
      on:click={() => modalOpen = true}
    >
      Open Modal
    </button>
  </PageHeader>

  <Stack gap="xl">
    <!-- Responsive Info Section -->
    <Section withBackground>
      <Card>
        <h2 class="text-xl font-bold mb-4" style="color: var(--accent-primary);">
          Current Viewport Info
        </h2>
        <Flex gap="md" wrap="wrap">
          <div>
            <strong>Breakpoint:</strong> {$currentBreakpoint}
          </div>
          <div>
            <strong>Mobile:</strong> {$isMobile ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Desktop:</strong> {$isDesktop ? 'Yes' : 'No'}
          </div>
        </Flex>
      </Card>
    </Section>

    <!-- Tabs Demo -->
    <Section>
      <Tabs {tabs} bind:activeTab variant="line" let:currentTab>
        {#if currentTab === 'overview'}
          <Stack gap="lg">
            <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
              Layout System Overview
            </h2>
            <p style="color: var(--text-secondary);">
              This page demonstrates the comprehensive layout system built for SvelteKit.
              All components are responsive, accessible, and composable.
            </p>

            <Grid cols={3} gap="lg">
              <Card variant="bordered">
                <h3 class="font-bold mb-2" style="color: var(--accent-primary);">
                  Core Primitives
                </h3>
                <p class="text-sm" style="color: var(--text-secondary);">
                  Container, Grid, Stack, Flex, Section
                </p>
              </Card>

              <Card variant="bordered">
                <h3 class="font-bold mb-2" style="color: var(--accent-primary);">
                  Advanced Components
                </h3>
                <p class="text-sm" style="color: var(--text-secondary);">
                  Sidebar, Split, Card, Panel, Tabs, Modal
                </p>
              </Card>

              <Card variant="bordered">
                <h3 class="font-bold mb-2" style="color: var(--accent-primary);">
                  Utilities
                </h3>
                <p class="text-sm" style="color: var(--text-secondary);">
                  Breakpoint detection, responsive stores
                </p>
              </Card>
            </Grid>
          </Stack>

        {:else if currentTab === 'components'}
          <Stack gap="lg">
            <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
              Component Examples
            </h2>

            <!-- Grid Demo -->
            <div>
              <h3 class="text-xl font-semibold mb-4" style="color: var(--accent-secondary);">
                Grid Component
              </h3>
              <Grid cols={3} gap="md">
                {#each demoCards as card}
                  <Card interactive>
                    <h4 class="font-bold mb-2">{card.title}</h4>
                    <p class="text-sm" style="color: var(--text-secondary);">
                      {card.description}
                    </p>
                  </Card>
                {/each}
              </Grid>
            </div>

            <!-- Split Demo -->
            <div>
              <h3 class="text-xl font-semibold mb-4" style="color: var(--accent-secondary);">
                Split Component (2:1 ratio)
              </h3>
              <Split ratio="2:1" gap="lg">
                <Card slot="left" variant="elevated">
                  <h4 class="font-bold mb-2">Main Content (2/3)</h4>
                  <p class="text-sm" style="color: var(--text-secondary);">
                    This is the larger section taking up 2/3 of the width.
                  </p>
                </Card>
                <Card slot="right" variant="elevated">
                  <h4 class="font-bold mb-2">Sidebar (1/3)</h4>
                  <p class="text-sm" style="color: var(--text-secondary);">
                    Smaller sidebar section.
                  </p>
                </Card>
              </Split>
            </div>

            <!-- Panel Demo -->
            <div>
              <h3 class="text-xl font-semibold mb-4" style="color: var(--accent-secondary);">
                Collapsible Panels
              </h3>
              <Stack gap="md">
                <Panel title="What is this layout system?">
                  <p style="color: var(--text-secondary);">
                    A comprehensive collection of composable layout components designed for
                    SvelteKit applications. It provides responsive, accessible, and flexible
                    building blocks for any layout pattern.
                  </p>
                </Panel>

                <Panel title="How do I use it?" defaultOpen>
                  <p style="color: var(--text-secondary);">
                    Import components from $lib/layouts and compose them together. All components
                    are fully typed with TypeScript and documented with examples.
                  </p>
                </Panel>

                <Panel title="Is it responsive?">
                  <p style="color: var(--text-secondary);">
                    Yes! All components follow mobile-first design principles and include
                    intelligent breakpoint handling. Resize your browser to see it in action.
                  </p>
                </Panel>
              </Stack>
            </div>

          </Stack>

        {:else if currentTab === 'responsive'}
          <Stack gap="lg">
            <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
              Responsive Behavior
            </h2>

            <Card>
              <h3 class="font-bold mb-4" style="color: var(--accent-primary);">
                Breakpoint System
              </h3>
              <Grid cols={2} gap="md">
                <div class="p-4 rounded" style="background-color: var(--bg-elevated);">
                  <strong>sm:</strong> 640px
                </div>
                <div class="p-4 rounded" style="background-color: var(--bg-elevated);">
                  <strong>md:</strong> 768px
                </div>
                <div class="p-4 rounded" style="background-color: var(--bg-elevated);">
                  <strong>lg:</strong> 1024px
                </div>
                <div class="p-4 rounded" style="background-color: var(--bg-elevated);">
                  <strong>xl:</strong> 1280px
                </div>
              </Grid>
            </Card>

            <Card>
              <h3 class="font-bold mb-4" style="color: var(--accent-primary);">
                Auto-Responsive Grid
              </h3>
              <p class="mb-4 text-sm" style="color: var(--text-secondary);">
                This grid automatically adjusts columns based on available space (min 200px per column)
              </p>
              <Grid minColWidth="200px" gap="sm">
                {#each Array(8) as _, i}
                  <div class="p-4 rounded text-center" style="background-color: var(--bg-elevated);">
                    Item {i + 1}
                  </div>
                {/each}
              </Grid>
            </Card>

            <Card>
              <h3 class="font-bold mb-4" style="color: var(--accent-primary);">
                Conditional Rendering
              </h3>
              <div class="p-4 rounded" style="background-color: var(--bg-elevated);">
                {#if $isMobile}
                  <p>📱 Mobile layout is active</p>
                {:else}
                  <p>🖥️ Desktop layout is active</p>
                {/if}
              </div>
            </Card>
          </Stack>
        {/if}
      </Tabs>
    </Section>

    <!-- Card Variants Section -->
    <Section withBorder>
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        Card Variants
      </h2>
      <Grid cols={2} gap="lg">
        <Card variant="default">
          <h3 class="font-bold mb-2">Default Card</h3>
          <p class="text-sm" style="color: var(--text-secondary);">
            Standard card with border
          </p>
        </Card>

        <Card variant="elevated">
          <h3 class="font-bold mb-2">Elevated Card</h3>
          <p class="text-sm" style="color: var(--text-secondary);">
            Card with shadow elevation
          </p>
        </Card>

        <Card variant="bordered">
          <h3 class="font-bold mb-2">Bordered Card</h3>
          <p class="text-sm" style="color: var(--text-secondary);">
            Card with thick border
          </p>
        </Card>

        <Card variant="glass">
          <h3 class="font-bold mb-2">Glass Card</h3>
          <p class="text-sm" style="color: var(--text-secondary);">
            Card with glassmorphism effect
          </p>
        </Card>
      </Grid>
    </Section>

    <!-- Flex Examples -->
    <Section>
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        Flex Layouts
      </h2>
      <Stack gap="md">
        <Card>
          <Flex justify="between" align="center">
            <span>Space Between</span>
            <span style="color: var(--accent-primary);">→</span>
          </Flex>
        </Card>

        <Card>
          <Flex justify="center" align="center" gap="md">
            <span>Centered</span>
            <span style="color: var(--accent-secondary);">✓</span>
          </Flex>
        </Card>

        <Card>
          <Flex justify="end" gap="sm">
            <button class="px-3 py-1 rounded" style="background-color: var(--bg-elevated);">
              Cancel
            </button>
            <button class="px-3 py-1 rounded" style="background-color: var(--accent-primary); color: var(--bg-primary);">
              Confirm
            </button>
          </Flex>
        </Card>
      </Stack>
    </Section>
  </Stack>
</Container>

<!-- Modal Demo -->
<Modal bind:open={modalOpen} title="Example Modal" size="lg" on:close={() => console.log('Modal closed')}>
  <Stack gap="md">
    <p style="color: var(--text-primary);">
      This is an example modal dialog. It includes:
    </p>
    <ul class="list-disc list-inside space-y-2" style="color: var(--text-secondary);">
      <li>Accessible ARIA attributes</li>
      <li>Backdrop click to close</li>
      <li>ESC key to close</li>
      <li>Body scroll lock when open</li>
      <li>Smooth animations</li>
      <li>Multiple size variants</li>
    </ul>
  </Stack>

  <div slot="footer">
    <Flex justify="end" gap="sm">
      <button
        class="px-4 py-2 rounded"
        style="background-color: var(--bg-surface); border: 1px solid var(--border-color);"
        on:click={() => modalOpen = false}
      >
        Close
      </button>
      <button
        class="px-4 py-2 rounded"
        style="background-color: var(--accent-primary); color: var(--bg-primary);"
        on:click={() => {
          alert('Action confirmed!');
          modalOpen = false;
        }}
      >
        Confirm
      </button>
    </Flex>
  </div>
</Modal>
