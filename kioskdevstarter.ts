import { DevKioskApi } from "kiosktsapplib";
import { KioskApp } from "kiosktsapplib";

window.addEventListener("load", () => {
    console.log("kiosktsapplib: kioskdevstarter let's start...");
    let api = new DevKioskApi();
    registerDevRoutes(api)
    api.initApi()
        .catch((e) => {
            console.log(`Exception when initializing: ${e}`);
        })
        .finally(() => {
            let app: KioskApp|null = document.querySelector("#kiosk-app");
            if (app) {
                app.apiContext = api;
                console.log(app.apiContext);
            } else {
                console.log("there is no app.");
            }

        });
});

function registerDevRoutes(api: DevKioskApi) {
    api.registerRoute("kioskfilemakerworkstation.workstation_actions", "kioskfilemakerworkstation/actions")
}