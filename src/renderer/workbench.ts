import type { DiscordExtensionsApi } from '../shared/ipc';
import type {
  CreateWorkbenchModuleRequest,
  PluginCategory,
  WorkbenchModuleResult,
  WorkbenchTemplate
} from '../shared/types';

declare global {
  interface Window {
    discordExtensions: DiscordExtensionsApi;
  }
}

const moduleId = document.getElementById('moduleId') as HTMLInputElement;
const moduleName = document.getElementById('moduleName') as HTMLInputElement;
const moduleAuthor = document.getElementById('moduleAuthor') as HTMLInputElement;
const moduleDescription = document.getElementById('moduleDescription') as HTMLTextAreaElement;
const moduleCategory = document.getElementById('moduleCategory') as HTMLSelectElement;
const moduleLanguage = document.getElementById('moduleLanguage') as HTMLSelectElement;
const templateDescription = document.getElementById('templateDescription') as HTMLDivElement;
const createModuleButton = document.getElementById('createModule') as HTMLButtonElement;
const exportModuleButton = document.getElementById('exportModule') as HTMLButtonElement;
const openModsButton = document.getElementById('openMods') as HTMLButtonElement;
const output = document.getElementById('workbenchOutput') as HTMLPreElement;

let templates: WorkbenchTemplate[] = [];
let lastResult: WorkbenchModuleResult | null = null;

function selectedTemplate(): WorkbenchTemplate | undefined {
  return templates.find((template) => template.language === moduleLanguage.value);
}

function renderTemplateDescription() {
  const template = selectedTemplate();
  templateDescription.textContent = template
    ? `${template.description} Entry: ${template.entry}`
    : 'Select a module language.';
}

async function initialize() {
  templates = await window.discordExtensions.listWorkbenchTemplates();
  moduleLanguage.innerHTML = templates
    .map((template) => `<option value="${template.language}">${template.label}</option>`)
    .join('');
  renderTemplateDescription();
}

moduleLanguage.addEventListener('change', renderTemplateDescription);

createModuleButton.addEventListener('click', async () => {
  const template = selectedTemplate();
  if (!template) return;

  const request: CreateWorkbenchModuleRequest = {
    id: moduleId.value,
    name: moduleName.value,
    author: moduleAuthor.value,
    description: moduleDescription.value,
    category: moduleCategory.value as PluginCategory,
    language: template.language
  };

  createModuleButton.disabled = true;
  output.textContent = 'Creating module...';
  try {
    lastResult = await window.discordExtensions.createWorkbenchModule(request);
    exportModuleButton.disabled = false;
    output.textContent = JSON.stringify(lastResult, null, 2);
  } catch (error) {
    output.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    createModuleButton.disabled = false;
  }
});

exportModuleButton.addEventListener('click', async () => {
  if (!lastResult) return;
  const exported = await window.discordExtensions.exportWorkbenchModule(lastResult.id);
  if (exported) {
    output.textContent = `${output.textContent}\n\nExported: ${exported}`;
  }
});

openModsButton.addEventListener('click', async () => {
  const folder = await window.discordExtensions.openModsFolder();
  output.textContent = `${output.textContent}\n\nMods folder: ${folder}`;
});

void initialize();
