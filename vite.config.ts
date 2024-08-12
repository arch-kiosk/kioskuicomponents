import { defineConfig, searchForWorkspaceRoot, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

// noinspection JSUnusedGlobalSymbols
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, "env");
    return {
        plugins: [
            createHtmlPlugin({
                inject: {
                    ...env,
                },

            }),
            // copy({
            //   targets: [ { src: '../../kioskfilemakerworkstationplugin/static/kioskfilemakerworkstation.css',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }, {
            //     src: '../../kioskfilemakerworkstationplugin/static/scripts',
            //     dest:'./kioskfilemakerworkstation/static'
            //   }],
            //   hook: 'buildStart'
            // }),
        ],
        esbuild:
            command == "build"
                ? {
                    //No console.logs in the distribution
                    drop: ["console", "debugger"],
                }
                : {},
        build: {
            outDir: "./dist",
             lib: {
                entry: "./kioskuicomponents.ts",
                formats: ["es"],
            },
            // rollupOptions: {
            //     external: [/^lit/]
            //   // external: [/^lit/, /@vaadin.*/]
            // }
        },
        server: {
            fs: {
                strict: true,
                host: true,
                allow: [searchForWorkspaceRoot(process.cwd()), "../../../static/scripts/kioskapplib"],
            },
        },
        publicDir: "/static"
    };
});
