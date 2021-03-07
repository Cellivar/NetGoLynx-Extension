
const urlKey = "server_address";

let redirectProto = "https";
let redirectHost = "Please.set.a.NetGoLynx.server.address.by.clicking.on.the.extension.icon";

chrome.webRequest.onBeforeRequest.addListener(
    function(details){
        let url = new URL(details.url);
        url.host = redirectHost;
        url.protocol = redirectProto;
        return {
            redirectUrl: url.toString()
        };
    },
    {
        urls: ["*://go/*"]
    },
    ["blocking"]
);

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes[urlKey]) {
        var newUrl = changes[urlKey].newValue;
        console.log("Loaded NetGoLynx server as " + newUrl);
        var u = new URL(newUrl);
        redirectProto = u.protocol;
        redirectHost = u.host
    }
});

chrome.storage.sync.get(urlKey, function(results) {
    if (urlKey) {
        console.log("Loaded NetGoLynx server as " + results[urlKey]);
        var u = new URL(results[urlKey]);
        redirectProto = u.protocol;
        redirectHost = u.host
    }
});