const NOTIFICATION_TYPES = {
	console: 'console',
	system: 'system',
	// page: 'page' to apply another type add your new input(checkbox) id from html here
}

const OPTIONS_KEY = 'how-fast-options'

const checkboxes = {}

window.addEventListener('load', async () => {
    await initCheckboxes()
    await getInitialSettings()
});

async function initCheckboxes() {
  for (const key in NOTIFICATION_TYPES) {
    checkboxes[key] = document.getElementById(key)
    checkboxes[key] && checkboxes[key].addEventListener('change', async (event) => {
    	await changeSettings(NOTIFICATION_TYPES[key], event.target.checked)
    })
  }
}

async function getInitialSettings() {  
    const storage = await chrome.storage.sync.get(['how-fast-settings']);
	const existedSettings = storage['how-fast-settings'] || {}

	if (Object.keys(existedSettings).length) {
		for (const key in existedSettings) {
			existedSettings[key] && checkboxes[key].click()
		}
	} else {
		checkboxes[NOTIFICATION_TYPES.console].click()
	}
}

async function changeSettings(type, value) {
    const storage = await chrome.storage.sync.get(['how-fast-settings']);
	const existedSettings = storage['how-fast-settings'] || {}

	chrome.storage.sync.set({'how-fast-settings': {
		...existedSettings,
		[type]: value
	}});
}
