const NOTIFY_TYPES = {
    console: showNotificationInConsole,
    system: showSystemNotification
    // page: showPageNotification, you can add your way to show metrics
}

const NOTIFY_SWITCHER = {
    console: false,
    page: false,
    system: false
}

let cls = 0
const waitTime = 2000

addPerformanceObserver()

window.addEventListener("load", async () => {

    await getSettings()
    await wait(waitTime)

    const performance = checkPerformance()

    showPerformanceMetrics()
})

function showPerformanceMetrics() {
    Object.keys(NOTIFY_SWITCHER).forEach(key => {
        if (NOTIFY_SWITCHER[key]) {
            NOTIFY_TYPES[key](performance)
        }
    })
}


async function getSettings() {
    const storage = await chrome.storage.sync.get(['how-fast-settings']);
	const existedSettings = storage['how-fast-settings']

    for (const key in existedSettings) {
        NOTIFY_SWITCHER[key] = existedSettings[key]
    }
}

function checkPerformance() {
    const performanceData = {}
    const [downloadedDataSize, cssCounter, jsCounter] = getDataSize()
    const lcpTime = getLcpTime()
    const loadingTime = getLoadingTime()

    performanceData.loadingTime = `Time to interactive: ${+loadingTime.toFixed(2)}s`
    performanceData.downloadedDataSize = `${downloadedDataSize}kB downloaded from server`
    performanceData.cssCounter = `${cssCounter} css files`
    performanceData.jsCounter = `${jsCounter} js files`
    performanceData.lcpTime = `LCP time: ${Math.round(+lcpTime)}ms`
    performanceData.cls = `CLS: ${+cls.toFixed(4)}px`

    return performanceData
}

function wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

function getLoadingTime() {
    const [entry] = performance.getEntriesByType("navigation");
    return entry.domContentLoadedEventEnd / 1000 || 0
}


function addPerformanceObserver() {
    const hasObserver = 'PerformanceObserver' in window
    let observer = hasObserver && new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
                cls += entry.value;
            }
        }
    });
    observer && observer.observe({type: 'layout-shift', buffered: true});
}

function getDataSize() {
    let downloadedDataSize = 0
    let cssCounter = 0
    let jsCounter = 0

    performance.getEntriesByType('resource').forEach((resource) => {

        if (resource.initiatorType === 'css') {
            cssCounter++
        }

        if (resource.initiatorType === 'script') {
            jsCounter++
        }

        if (resource.transferSize !== 0) {
            downloadedDataSize += +resource.transferSize
        }
    });

    return [downloadedDataSize / 1000 || 0, cssCounter, jsCounter]
}

function getLcpTime() {
    const perfEntries = performance.getEntriesByType('paint');
    const lcpEntry = perfEntries && perfEntries[perfEntries.length - 1];

    return lcpEntry?.startTime || 0;
}

async function showSystemNotification(performanceData) {
    const hasNotification = window.Notification
    hasNotification && Notification.requestPermission().then((perm) =>{
        if (perm === 'granted') {
            const notify = new Notification('Скорость загрузки и парсинга на сайте',{body: `${performanceData} секунды`})
        }
    })
}

function showNotificationInConsole(performanceData) {
    for (const key of Object.keys(performanceData)) {
      console.log(`%c${performanceData[key]}`, 'color: white; background: #212529; font-size: 20px');
    }
}

// function showPageNotification(performanceData) {
//     if (performanceData) {
//         const notification = createNotificationNode(performanceData)
//         notification.innerText = `Скорость загрузки и парсинга на сайте ${performanceData} секунды`
//         document.body.appendChild(notification)
//         setTimeout(() => {
//             document.body.removeChild(notification)
//         }, 3000)
//     }
// }

// async function checkSystemNotificationPermission() {
    // if (Notification.permission === 'default') {
    //     Notification.requestPermission()
    // }
    // Notification.requestPermission().then((perm) =>{
        
//     })
// }