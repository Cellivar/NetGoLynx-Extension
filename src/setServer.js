const ServerStatusEnum = Object.freeze({
    "connected": 1,
    "failed": 2,
    "invalid": 3,
    "connecting": 4,
});

const ServerApi = "_/Home/Info"
const urlKey = "server_address";

let serverInput = document.getElementById('serverAddress');

let serverTimeout = null;

serverInput.addEventListener('input', (e) => {
    clearTimeout(serverTimeout);

    if (serverInput.validity.valid) {
        serverTimeout = setTimeout(async function () {
            // Test to see if the server exists.
            indicateServerStatus(ServerStatusEnum.connecting);
            let srvStatus = await testServer(serverInput.value);
            if (srvStatus === ServerStatusEnum.connected) {
                saveServerUrl(serverInput.value);
            }
            indicateServerStatus(srvStatus);
        }, 500);
    } else {
        indicateServerStatus(ServerStatusEnum.invalid)
    }
});

function saveServerUrl(address) {
    chrome.storage.sync.set({[urlKey]: address}, function() {
        console.log("Synced server address as " + address);
    })
}

async function testServer(address) {
    address = sanitizeAddress(address) + ServerApi;
    console.log("Looking for API response from " + address);
    return await fetch(address, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.service === "netgolynx") {
            return ServerStatusEnum.connected;
        } else {
            return ServerStatusEnum.failed;
        }
    })
    .catch((reason) => {
        console.log(reason);
        return ServerStatusEnum.failed;
    });
}

function sanitizeAddress(address) {
    if (!address.endsWith("/")) {
        return address + "/";
    }
    return address;
}

function indicateServerStatus(status) {
    switch (status) {
        case ServerStatusEnum.connected:
            updateDisplay("Redirecting go/ links to:", "😸", false);
            return status;
        case ServerStatusEnum.connecting:
            updateDisplay("Checking server...", "😽", true);
            return status;
        case ServerStatusEnum.failed:
            updateDisplay("Couldn't find server at:", "😿", true);
            return status;
        case ServerStatusEnum.invalid:
            updateDisplay("Enter a valid NetGoLynx server:", "🐱", true);
            return status;
        default:
            updateDisplay("Unknown problem! Try again?", "🙀", true);
            return status;
    }
}

let serverStatus = document.getElementById('serverStatus');
let serverInputLabel = document.getElementById("serverAddressLabel");
let serverStatusEmoji = document.getElementById('lynxEmoji');

function updateDisplay(displayText, lynxEmoji, displayUrlHelper) {
    serverStatus.innerText = displayText;
    serverInputLabel.style.visibility = displayUrlHelper ? "visible" : "hidden";
    serverStatusEmoji.innerText = lynxEmoji;
}

chrome.storage.sync.get(urlKey, function(results) {
    if (urlKey) {
        serverInput.value = results[urlKey];
        indicateServerStatus(ServerStatusEnum.connected);
    } else {
        serverInput.value = null;
        indicateServerStatus(ServerStatusEnum.invalid);
    }
});