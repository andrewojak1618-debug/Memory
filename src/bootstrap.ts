import './styles/style.scss';

const RESULT_VIEWS_PATH: string = './result-views.html';
const RESULT_VIEWS_ID: string = 'result_views';

/** Loads the static result views before application modules access the DOM. */
async function loadResultViews(): Promise<void> {
  const host: HTMLElement | null = document.getElementById(RESULT_VIEWS_ID);
  if (!host) throw new Error('The result view container is missing.');
  const response: Response = await fetch(RESULT_VIEWS_PATH);
  if (!response.ok) throw new Error('The result views could not be loaded.');
  host.outerHTML = await response.text();
}

/** Displays a readable fallback if the local HTML fragment cannot be loaded. */
function showLoadError(error: unknown): void {
  const host: HTMLElement | null = document.getElementById(RESULT_VIEWS_ID);
  const detail: string = error instanceof Error ? ` ${error.message}` : '';
  if (host) host.textContent = `The application could not be loaded.${detail}`;
}

/** Starts the application only after all required markup is present. */
async function startApplication(): Promise<void> {
  try {
    await loadResultViews();
    await import('./main');
  } catch (error: unknown) {
    showLoadError(error);
  }
}

void startApplication();
